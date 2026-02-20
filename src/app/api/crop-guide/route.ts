import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Validate session
  const session = await validateSession();
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { searchParams } = new URL(req.url);
    const cropName = searchParams.get('crop');
    const language = normalizeGuideLanguage(searchParams.get('language'));

    if (cropName) {
      const normalizedCropName = normalizeCropName(cropName);
      console.log('Fetching crop guide for:', normalizedCropName);
      
      // Get specific crop guide
      const guide = await prisma.cropGuide.findFirst({
        where: {
          cropName: {
            equals: normalizedCropName,
            mode: 'insensitive'
          }
        }
      });

      if (!guide) {
        console.log('Crop not found in database, generating with AI:', normalizedCropName);
        try {
          // Generate and persist in database so future users can reuse it
          const generatedGuide = await generateCropGuide(normalizedCropName, language);

          let savedGuide;
          try {
            savedGuide = await prisma.cropGuide.create({
              data: {
                cropName: normalizedCropName,
                overview: generatedGuide.overview,
                climate: generatedGuide.climate,
                soilType: generatedGuide.soilType,
                sowing: generatedGuide.sowing,
                irrigation: generatedGuide.irrigation,
                fertilizer: generatedGuide.fertilizer,
                pests: generatedGuide.pests,
                diseases: generatedGuide.diseases,
                harvesting: generatedGuide.harvesting,
                yield: generatedGuide.yield,
                videoUrls: generatedGuide.videoUrls,
                imageUrl: generatedGuide.imageUrl,
                language,
              }
            });
          } catch (saveError) {
            console.error('Saving generated crop guide failed, attempting refetch:', saveError);
            savedGuide = await prisma.cropGuide.findFirst({
              where: {
                cropName: {
                  equals: normalizedCropName,
                  mode: 'insensitive'
                }
              }
            });
          }

          return NextResponse.json({
            status: 'success',
            data: savedGuide ?? generatedGuide,
            source: savedGuide ? 'database' : 'ai'
          });
        } catch (aiError) {
          console.error('AI generation failed:', aiError);
          if (isQuotaExceededError(aiError)) {
            const fallbackGuide = getFallbackCropGuide(normalizedCropName, language);
            let savedFallback = null;

            try {
              savedFallback = await prisma.cropGuide.create({
                data: {
                  cropName: normalizedCropName,
                  overview: fallbackGuide.overview,
                  climate: fallbackGuide.climate,
                  soilType: fallbackGuide.soilType,
                  sowing: fallbackGuide.sowing,
                  irrigation: fallbackGuide.irrigation,
                  fertilizer: fallbackGuide.fertilizer,
                  pests: fallbackGuide.pests,
                  diseases: fallbackGuide.diseases,
                  harvesting: fallbackGuide.harvesting,
                  yield: fallbackGuide.yield,
                  videoUrls: fallbackGuide.videoUrls,
                  imageUrl: fallbackGuide.imageUrl,
                  language,
                }
              });
            } catch (fallbackSaveError) {
              console.error('Saving fallback crop guide failed, attempting refetch:', fallbackSaveError);
              savedFallback = await prisma.cropGuide.findFirst({
                where: {
                  cropName: {
                    equals: normalizedCropName,
                    mode: 'insensitive'
                  }
                }
              });
            }

            return NextResponse.json({
              status: 'success',
              data: savedFallback ?? fallbackGuide,
              source: savedFallback ? 'database' : 'fallback',
              message: 'AI quota exceeded. Returned fallback guide.'
            });
          }

          return NextResponse.json({
            status: 'error',
            message: aiError instanceof Error ? aiError.message : 'Failed to generate crop guide with AI'
          }, { status: 500 });
        }
      }

      return NextResponse.json({
        status: 'success',
        data: guide,
        source: 'database'
      });
    } else {
      // Get all available guides
      const guides = await prisma.cropGuide.findMany({
        orderBy: { cropName: 'asc' },
        select: {
          id: true,
          cropName: true,
          overview: true,
          imageUrl: true,
          yield: true
        }
      });

      // If no guides in database, return popular crops list
      if (guides.length === 0) {
        return NextResponse.json({
          status: 'success',
          data: getPopularCrops(),
          source: 'default'
        });
      }

      return NextResponse.json({
        status: 'success',
        data: guides,
        source: 'database'
      });
    }
  } catch (error) {
    console.error('Crop guide API error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to fetch crop guide'
    }, { status: 500 });
  }
}

// Generate crop guide using AI (fallback)
async function generateCropGuide(cropName: string, language: 'en' | 'hi' | 'mr') {
  // Import Gemini dynamically
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    throw new Error('Set GEMINI_API_KEY or GEMINI_API_KEYS in environment variables');
  }

  const languageInstruction = resolveGuideLanguageInstruction(language);

  const prompt = `Generate a comprehensive farming guide for ${cropName} in India.
Respond only in ${languageInstruction}.
Do not mix multiple languages.
Use plain text only (no markdown headings, no **, no ###).
Provide detailed information in the following structure:

Overview: Brief description (2-3 sentences)
Climate: Suitable climate conditions (temperature range, season)
Soil Type: Best soil types and pH range
Sowing: Sowing season, seed rate, spacing, depth
Irrigation: Water requirements, irrigation schedule
Fertilizer: NPK requirements, organic options, application timing
Pests: Common pests and their management (5-6 pests)
Diseases: Common diseases and treatment (5-6 diseases)
Harvesting: When and how to harvest, indicators of maturity
Yield: Expected yield per acre/hectare

Keep it practical and farmer-friendly.`;

  const result = await generateWithFallback(keys, async (key) => {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    return model.generateContent(prompt);
  });
  const text = result.response.text();

  // Parse the response into structured format
  return {
    cropName: cropName,
    overview: cleanGuideText(extractSection(text, 'Overview')),
    climate: cleanGuideText(extractSection(text, 'Climate')),
    soilType: cleanGuideText(extractSection(text, 'Soil Type')),
    sowing: cleanGuideText(extractSection(text, 'Sowing')),
    irrigation: cleanGuideText(extractSection(text, 'Irrigation')),
    fertilizer: cleanGuideText(extractSection(text, 'Fertilizer')),
    pests: cleanGuideText(extractSection(text, 'Pests')),
    diseases: cleanGuideText(extractSection(text, 'Diseases')),
    harvesting: cleanGuideText(extractSection(text, 'Harvesting')),
    yield: cleanGuideText(extractSection(text, 'Yield')),
    videoUrls: [],
    imageUrl: null,
    language
  };
}

function getGeminiApiKeys(): string[] {
  const primary = process.env.GEMINI_API_KEY?.trim();
  const multiple = (process.env.GEMINI_API_KEYS || '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);

  if (primary && !multiple.includes(primary)) {
    return [primary, ...multiple];
  }

  return multiple;
}

function isRetryableGeminiError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('too many requests') ||
    message.includes('rate limit')
  );
}

async function generateWithFallback<T>(
  keys: string[],
  executor: (key: string) => Promise<T>
): Promise<T> {
  let lastError: unknown;

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    try {
      return await executor(key);
    } catch (error) {
      lastError = error;
      const shouldRetry = isRetryableGeminiError(error);
      const hasNextKey = index < keys.length - 1;

      if (shouldRetry && hasNextKey) {
        console.warn(`Crop guide Gemini key ${index + 1} hit quota/rate limit. Trying next key.`);
        continue;
      }

      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini request failed');
}

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}[:\\s]*(.*?)(?=\\n\\n[A-Z]|$)`, 'is');
  const match = text.match(regex);
  return match ? match[1].trim() : `Information about ${sectionName.toLowerCase()} will be added soon.`;
}

function cleanGuideText(value: string): string {
  return value
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(?!\s)/g, '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeGuideLanguage(value: string | null): 'en' | 'hi' | 'mr' {
  if (value === 'hi' || value === 'mr') {
    return value;
  }
  return 'en';
}

function normalizeCropName(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return value;
  }

  return cleaned
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function resolveGuideLanguageInstruction(language: 'en' | 'hi' | 'mr'): string {
  if (language === 'hi') {
    return 'Hindi using only Devanagari script';
  }
  if (language === 'mr') {
    return 'Marathi using only Devanagari script';
  }
  return 'English';
}

function isQuotaExceededError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  return lower.includes('429') || lower.includes('quota') || lower.includes('too many requests');
}

function getFallbackCropGuide(cropName: string, language: 'en' | 'hi' | 'mr') {
  if (language === 'hi') {
    return {
      cropName,
      overview: `${cropName} एक महत्वपूर्ण फसल है। स्थानीय मौसम और मिट्टी के अनुसार खेती की योजना बनाएं।`,
      climate: 'मध्यम तापमान और अच्छी धूप उपयुक्त रहती है। अत्यधिक गर्मी/ठंड से बचाव करें।',
      soilType: 'अच्छी जल निकासी वाली दोमट मिट्टी बेहतर रहती है। pH लगभग 6.0 से 7.5 रखें।',
      sowing: 'समय पर बुवाई करें। प्रमाणित बीज और उचित दूरी का पालन करें।',
      irrigation: 'मिट्टी की नमी देखकर सिंचाई करें। जलभराव न होने दें।',
      fertilizer: 'मिट्टी परीक्षण के आधार पर NPK और जैविक खाद का संतुलित उपयोग करें।',
      pests: 'नियमित निगरानी करें। शुरुआत में जैविक/समेकित कीट प्रबंधन अपनाएं।',
      diseases: 'रोग के लक्षण दिखते ही प्रभावित भाग हटाएं और अनुशंसित उपचार करें।',
      harvesting: 'फसल पकने पर मौसम साफ रहने पर कटाई करें और सही भंडारण करें।',
      yield: 'उपज किस्म, मौसम और प्रबंधन पर निर्भर करती है।',
      videoUrls: [],
      imageUrl: null,
      language
    };
  }

  if (language === 'mr') {
    return {
      cropName,
      overview: `${cropName} हे महत्त्वाचे पीक आहे. स्थानिक हवामान व मातीप्रमाणे लागवड नियोजन करा.`,
      climate: 'मध्यम तापमान आणि पुरेसा सूर्यप्रकाश योग्य असतो. अतिउष्ण/अतिथंड परिस्थिती टाळा.',
      soilType: 'चांगला निचरा होणारी दोमट माती योग्य. pH साधारण 6.0 ते 7.5 ठेवा.',
      sowing: 'वेळेत पेरणी करा. प्रमाणित बियाणे आणि योग्य अंतर ठेवा.',
      irrigation: 'मातीतील ओलावा पाहून पाणी द्या. पाणी साचू देऊ नका.',
      fertilizer: 'मृदा परीक्षणानुसार NPK आणि सेंद्रिय खतांचा संतुलित वापर करा.',
      pests: 'नियमित पाहणी करा. सुरुवातीला जैविक/एकात्मिक किड व्यवस्थापन वापरा.',
      diseases: 'लक्षणे दिसताच बाधित भाग काढून शिफारस केलेला उपचार करा.',
      harvesting: 'पीक तयार झाल्यावर स्वच्छ हवामानात कापणी करा आणि योग्य साठवण करा.',
      yield: 'उत्पन्न जात, हवामान आणि व्यवस्थापनावर अवलंबून असते.',
      videoUrls: [],
      imageUrl: null,
      language
    };
  }

  return {
    cropName,
    overview: `${cropName} is an important crop. Plan cultivation based on local weather and soil.` ,
    climate: 'Moderate temperature and good sunlight are suitable. Protect from extreme heat or cold.',
    soilType: 'Well-drained loamy soil is preferred. Keep soil pH around 6.0 to 7.5.',
    sowing: 'Sow on time using certified seeds and proper spacing.',
    irrigation: 'Irrigate based on soil moisture. Avoid waterlogging.',
    fertilizer: 'Apply balanced NPK and organic nutrients based on soil testing.',
    pests: 'Monitor regularly and start with integrated pest management practices.',
    diseases: 'Remove affected parts early and apply recommended treatment promptly.',
    harvesting: 'Harvest at maturity during clear weather and store properly.',
    yield: 'Yield depends on variety, climate, and management practices.',
    videoUrls: [],
    imageUrl: null,
    language
  };
}

function getPopularCrops() {
  return [
    { id: '1', cropName: 'Wheat', overview: 'Major cereal crop grown in winter season', imageUrl: null, yield: '40-50 quintals/hectare' },
    { id: '2', cropName: 'Rice', overview: 'Staple food crop requiring high water', imageUrl: null, yield: '50-60 quintals/hectare' },
    { id: '3', cropName: 'Cotton', overview: 'Important cash crop for textile industry', imageUrl: null, yield: '20-25 quintals/hectare' },
    { id: '4', cropName: 'Sugarcane', overview: 'Commercial crop for sugar production', imageUrl: null, yield: '700-900 quintals/hectare' },
    { id: '5', cropName: 'Maize', overview: 'Versatile crop for food and feed', imageUrl: null, yield: '60-70 quintals/hectare' },
    { id: '6', cropName: 'Potato', overview: 'High-value vegetable crop', imageUrl: null, yield: '250-300 quintals/hectare' },
    { id: '7', cropName: 'Tomato', overview: 'Popular vegetable with good returns', imageUrl: null, yield: '300-400 quintals/hectare' },
    { id: '8', cropName: 'Onion', overview: 'Essential vegetable with export potential', imageUrl: null, yield: '200-250 quintals/hectare' }
  ];
}
