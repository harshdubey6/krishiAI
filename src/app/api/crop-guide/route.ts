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

      if (guide && !hasMultilingualCoverage(guide)) {
        try {
          const generatedGuide = await generateCropGuide(normalizedCropName);
          const updatedGuide = await prisma.cropGuide.update({
            where: { id: guide.id },
            data: {
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
              language: 'multi',
            }
          });

          return NextResponse.json({
            status: 'success',
            data: updatedGuide,
            source: 'database-upgraded'
          });
        } catch (upgradeError) {
          console.error('Guide upgrade to multilingual failed, using fallback multilingual guide:', upgradeError);
          const fallbackGuide = getFallbackCropGuide(normalizedCropName);
          return NextResponse.json({
            status: 'success',
            data: fallbackGuide,
            source: 'fallback'
          });
        }
      }

      if (!guide) {
        console.log('Crop not found in database, generating with AI:', normalizedCropName);
        try {
          // Generate and persist in database so future users can reuse it
          const generatedGuide = await generateCropGuide(normalizedCropName);

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
                language: 'multi',
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
            const fallbackGuide = getFallbackCropGuide(normalizedCropName);
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
                  language: 'multi',
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
      const mergedGuides = mergeWithPopularCrops(guides);

      return NextResponse.json({
        status: 'success',
        data: mergedGuides,
        source: guides.length === 0 ? 'default' : 'database+default'
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
async function generateCropGuide(cropName: string) {
  // Import Gemini dynamically
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    throw new Error('Set GEMINI_API_KEY or GEMINI_API_KEYS in environment variables');
  }

  const prompt = `Generate a comprehensive farming guide for ${cropName} in India.
Provide answers in all three languages: English, Hindi (Devanagari), and Marathi (Devanagari).
Use plain text only (no markdown headings, no **, no ###).
Provide detailed information in the following structure:

For each section, follow exactly this format:
SectionName:
EN: ...
HI: ...
MR: ...

Sections:
Overview
Climate
Soil Type
Sowing
Irrigation
Fertilizer
Pests
Diseases
Harvesting
Yield

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
    overview: ensureTriLanguageField(extractSection(text, 'Overview')),
    climate: ensureTriLanguageField(extractSection(text, 'Climate')),
    soilType: ensureTriLanguageField(extractSection(text, 'Soil Type')),
    sowing: ensureTriLanguageField(extractSection(text, 'Sowing')),
    irrigation: ensureTriLanguageField(extractSection(text, 'Irrigation')),
    fertilizer: ensureTriLanguageField(extractSection(text, 'Fertilizer')),
    pests: ensureTriLanguageField(extractSection(text, 'Pests')),
    diseases: ensureTriLanguageField(extractSection(text, 'Diseases')),
    harvesting: ensureTriLanguageField(extractSection(text, 'Harvesting')),
    yield: ensureTriLanguageField(extractSection(text, 'Yield')),
    videoUrls: [],
    imageUrl: null,
    language: 'multi'
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

function ensureTriLanguageField(value: string): string {
  const cleaned = cleanGuideText(value);
  if (!cleaned) {
    return 'EN: Information will be added soon.\nHI: जानकारी जल्द जोड़ी जाएगी।\nMR: माहिती लवकरच जोडली जाईल.';
  }

  if (hasAllLanguageTags(cleaned)) {
    return cleaned;
  }

  return `EN: ${cleaned}\nHI: ${cleaned}\nMR: ${cleaned}`;
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

function isQuotaExceededError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  return lower.includes('429') || lower.includes('quota') || lower.includes('too many requests');
}

function getFallbackCropGuide(cropName: string) {
  return {
    cropName,
    overview: buildTriLanguageBlock(
      `${cropName} is an important crop. Plan cultivation based on local weather and soil.`,
      `${cropName} एक महत्वपूर्ण फसल है। स्थानीय मौसम और मिट्टी के अनुसार खेती की योजना बनाएं।`,
      `${cropName} हे महत्त्वाचे पीक आहे. स्थानिक हवामान व मातीप्रमाणे लागवड नियोजन करा.`
    ),
    climate: buildTriLanguageBlock(
      'Moderate temperature and good sunlight are suitable. Protect from extreme heat or cold.',
      'मध्यम तापमान और अच्छी धूप उपयुक्त रहती है। अत्यधिक गर्मी/ठंड से बचाव करें।',
      'मध्यम तापमान आणि पुरेसा सूर्यप्रकाश योग्य असतो. अतिउष्ण/अतिथंड परिस्थिती टाळा.'
    ),
    soilType: buildTriLanguageBlock(
      'Well-drained loamy soil is preferred. Keep soil pH around 6.0 to 7.5.',
      'अच्छी जल निकासी वाली दोमट मिट्टी बेहतर रहती है। pH लगभग 6.0 से 7.5 रखें।',
      'चांगला निचरा होणारी दोमट माती योग्य. pH साधारण 6.0 ते 7.5 ठेवा.'
    ),
    sowing: buildTriLanguageBlock(
      'Sow on time using certified seeds and proper spacing.',
      'समय पर बुवाई करें। प्रमाणित बीज और उचित दूरी का पालन करें।',
      'वेळेत पेरणी करा. प्रमाणित बियाणे आणि योग्य अंतर ठेवा.'
    ),
    irrigation: buildTriLanguageBlock(
      'Irrigate based on soil moisture. Avoid waterlogging.',
      'मिट्टी की नमी देखकर सिंचाई करें। जलभराव न होने दें।',
      'मातीतील ओलावा पाहून पाणी द्या. पाणी साचू देऊ नका.'
    ),
    fertilizer: buildTriLanguageBlock(
      'Apply balanced NPK and organic nutrients based on soil testing.',
      'मिट्टी परीक्षण के आधार पर NPK और जैविक खाद का संतुलित उपयोग करें।',
      'मृदा परीक्षणानुसार NPK आणि सेंद्रिय खतांचा संतुलित वापर करा.'
    ),
    pests: buildTriLanguageBlock(
      'Monitor regularly and start with integrated pest management practices.',
      'नियमित निगरानी करें। शुरुआत में जैविक/समेकित कीट प्रबंधन अपनाएं।',
      'नियमित पाहणी करा. सुरुवातीला जैविक/एकात्मिक किड व्यवस्थापन वापरा.'
    ),
    diseases: buildTriLanguageBlock(
      'Remove affected parts early and apply recommended treatment promptly.',
      'रोग के लक्षण दिखते ही प्रभावित भाग हटाएं और अनुशंसित उपचार करें।',
      'लक्षणे दिसताच बाधित भाग काढून शिफारस केलेला उपचार करा.'
    ),
    harvesting: buildTriLanguageBlock(
      'Harvest at maturity during clear weather and store properly.',
      'फसल पकने पर मौसम साफ रहने पर कटाई करें और सही भंडारण करें।',
      'पीक तयार झाल्यावर स्वच्छ हवामानात कापणी करा आणि योग्य साठवण करा.'
    ),
    yield: buildTriLanguageBlock(
      'Yield depends on variety, climate, and management practices.',
      'उपज किस्म, मौसम और प्रबंधन पर निर्भर करती है।',
      'उत्पन्न जात, हवामान आणि व्यवस्थापनावर अवलंबून असते.'
    ),
    videoUrls: [],
    imageUrl: null,
    language: 'multi'
  };
}

function getPopularCrops() {
  return [
    { id: 'd-1', cropName: 'Wheat', overview: 'Major cereal crop grown in winter season', imageUrl: null, yield: '40-50 quintals/hectare' },
    { id: 'd-2', cropName: 'Rice', overview: 'Staple food crop requiring high water', imageUrl: null, yield: '50-60 quintals/hectare' },
    { id: 'd-3', cropName: 'Cotton', overview: 'Important cash crop for textile industry', imageUrl: null, yield: '20-25 quintals/hectare' },
    { id: 'd-4', cropName: 'Sugarcane', overview: 'Commercial crop for sugar production', imageUrl: null, yield: '700-900 quintals/hectare' },
    { id: 'd-5', cropName: 'Maize', overview: 'Versatile crop for food and feed', imageUrl: null, yield: '60-70 quintals/hectare' },
    { id: 'd-6', cropName: 'Potato', overview: 'High-value vegetable crop', imageUrl: null, yield: '250-300 quintals/hectare' },
    { id: 'd-7', cropName: 'Tomato', overview: 'Popular vegetable with good returns', imageUrl: null, yield: '300-400 quintals/hectare' },
    { id: 'd-8', cropName: 'Onion', overview: 'Essential vegetable with export potential', imageUrl: null, yield: '200-250 quintals/hectare' },
    { id: 'd-9', cropName: 'Millet', overview: 'Climate-resilient cereal suitable for dry regions', imageUrl: null, yield: '10-18 quintals/hectare' },
    { id: 'd-10', cropName: 'Sorghum', overview: 'Drought-tolerant crop for grain and fodder', imageUrl: null, yield: '18-25 quintals/hectare' },
    { id: 'd-11', cropName: 'Bajra', overview: 'Pearl millet grown in arid and semi-arid zones', imageUrl: null, yield: '12-20 quintals/hectare' },
    { id: 'd-12', cropName: 'Barley', overview: 'Rabi cereal used for feed and malt', imageUrl: null, yield: '35-45 quintals/hectare' },
    { id: 'd-13', cropName: 'Chickpea', overview: 'Major pulse crop in rabi season', imageUrl: null, yield: '12-20 quintals/hectare' },
    { id: 'd-14', cropName: 'Pigeon Pea', overview: 'Important pulse crop with deep root system', imageUrl: null, yield: '10-15 quintals/hectare' },
    { id: 'd-15', cropName: 'Green Gram', overview: 'Short-duration pulse crop with low input need', imageUrl: null, yield: '6-10 quintals/hectare' },
    { id: 'd-16', cropName: 'Black Gram', overview: 'Pulse crop suitable for multiple cropping systems', imageUrl: null, yield: '7-12 quintals/hectare' },
    { id: 'd-17', cropName: 'Groundnut', overview: 'Oilseed crop suitable for warm climate', imageUrl: null, yield: '18-25 quintals/hectare' },
    { id: 'd-18', cropName: 'Mustard', overview: 'Key oilseed crop in winter season', imageUrl: null, yield: '12-18 quintals/hectare' },
    { id: 'd-19', cropName: 'Soybean', overview: 'Protein-rich oilseed and pulse crop', imageUrl: null, yield: '15-25 quintals/hectare' },
    { id: 'd-20', cropName: 'Sunflower', overview: 'Oilseed crop with high market demand', imageUrl: null, yield: '12-20 quintals/hectare' },
    { id: 'd-21', cropName: 'Turmeric', overview: 'High-value spice crop with export potential', imageUrl: null, yield: '80-120 quintals/hectare' },
    { id: 'd-22', cropName: 'Ginger', overview: 'Rhizome spice crop for fresh and dry market', imageUrl: null, yield: '60-100 quintals/hectare' },
    { id: 'd-23', cropName: 'Chili', overview: 'Popular spice crop with strong demand', imageUrl: null, yield: '20-35 quintals/hectare' },
    { id: 'd-24', cropName: 'Brinjal', overview: 'Common vegetable crop with long harvest window', imageUrl: null, yield: '250-350 quintals/hectare' },
    { id: 'd-25', cropName: 'Cabbage', overview: 'Cool-season vegetable crop with good returns', imageUrl: null, yield: '250-400 quintals/hectare' }
  ];
}

function hasAllLanguageTags(value?: string | null) {
  const normalized = String(value || '').toUpperCase();
  return normalized.includes('EN:') && normalized.includes('HI:') && normalized.includes('MR:');
}

function hasMultilingualCoverage(guide: {
  language?: string | null;
  overview?: string | null;
  climate?: string | null;
  soilType?: string | null;
  sowing?: string | null;
  irrigation?: string | null;
  fertilizer?: string | null;
  pests?: string | null;
  diseases?: string | null;
  harvesting?: string | null;
  yield?: string | null;
}) {
  const fields = [
    guide.overview,
    guide.climate,
    guide.soilType,
    guide.sowing,
    guide.irrigation,
    guide.fertilizer,
    guide.pests,
    guide.diseases,
    guide.harvesting,
    guide.yield,
  ].filter((value): value is string => Boolean(value && value.trim()));

  if (fields.length === 0) {
    return false;
  }

  return guide.language?.toLowerCase() === 'multi' && fields.every((field) => hasAllLanguageTags(field));
}

function mergeWithPopularCrops(
  guides: Array<{ id: string; cropName: string; overview: string | null; imageUrl: string | null; yield: string | null }>
) {
  const map = new Map<string, { id: string; cropName: string; overview: string | null; imageUrl: string | null; yield: string | null }>();

  for (const crop of getPopularCrops()) {
    map.set(crop.cropName.toLowerCase(), crop);
  }

  for (const crop of guides) {
    map.set(crop.cropName.toLowerCase(), crop);
  }

  return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
}

function buildTriLanguageBlock(english: string, hindi: string, marathi: string) {
  return `EN: ${english}\nHI: ${hindi}\nMR: ${marathi}`;
}
