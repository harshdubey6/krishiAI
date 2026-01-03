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
      // Get specific crop guide
      const guide = await prisma.cropGuide.findUnique({
        where: { cropName: cropName }
      });

      if (!guide) {
        // If not found in database, return AI-generated guide
        const generatedGuide = await generateCropGuide(cropName);
        return NextResponse.json({
          status: 'success',
          data: generatedGuide,
          source: 'ai'
        });
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
async function generateCropGuide(cropName: string) {
  // Import Gemini dynamically
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Generate a comprehensive farming guide for ${cropName} in India. You MUST respond ONLY in the exact JSON format below. Do not include any text before or after the JSON:

{
  "overview": "Brief description of the crop, its importance, and main uses (2-3 sentences)",
  "climate": "Suitable climate conditions including temperature range (in Celsius), humidity, and best season for cultivation",
  "soilType": "Best soil types, pH range (e.g., 6.0-7.5), and soil preparation tips",
  "sowing": "Sowing season, seed rate per acre/hectare, spacing between plants and rows, sowing depth",
  "irrigation": "Water requirements, irrigation frequency, best irrigation methods, critical stages requiring water",
  "fertilizer": "NPK requirements, recommended fertilizers, organic options, application timing and method",
  "pests": "List of 4-5 common pests with their symptoms and control measures",
  "diseases": "List of 4-5 common diseases with their symptoms and treatment",
  "harvesting": "When to harvest (maturity indicators), harvesting methods, post-harvest handling",
  "yield": "Expected yield per acre and per hectare under good management"
}

Include both English and Hindi (in parentheses) for key terms where helpful.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse the JSON response
  try {
    // Remove any markdown code block markers if present
    let cleanedText = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    
    // Find the JSON object in the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      id: 'ai-generated',
      cropName: cropName,
      overview: parsed.overview || `${cropName} is a crop grown in India. Information being generated.`,
      climate: parsed.climate || 'Climate information not available.',
      soilType: parsed.soilType || 'Soil type information not available.',
      sowing: parsed.sowing || 'Sowing information not available.',
      irrigation: parsed.irrigation || 'Irrigation information not available.',
      fertilizer: parsed.fertilizer || 'Fertilizer information not available.',
      pests: parsed.pests || 'Pest management information not available.',
      diseases: parsed.diseases || 'Disease management information not available.',
      harvesting: parsed.harvesting || 'Harvesting information not available.',
      yield: parsed.yield || 'Yield information not available.',
      videoUrls: [],
      imageUrl: null,
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    console.error('Raw response:', text);
    
    // Fallback: try to extract sections using regex
    return {
      id: 'ai-generated',
      cropName: cropName,
      overview: extractSection(text, 'overview') || `${cropName} is an important crop grown in India.`,
      climate: extractSection(text, 'climate') || 'Information being generated.',
      soilType: extractSection(text, 'soilType') || extractSection(text, 'soil') || 'Information being generated.',
      sowing: extractSection(text, 'sowing') || 'Information being generated.',
      irrigation: extractSection(text, 'irrigation') || 'Information being generated.',
      fertilizer: extractSection(text, 'fertilizer') || 'Information being generated.',
      pests: extractSection(text, 'pests') || 'Information being generated.',
      diseases: extractSection(text, 'diseases') || 'Information being generated.',
      harvesting: extractSection(text, 'harvesting') || 'Information being generated.',
      yield: extractSection(text, 'yield') || 'Information being generated.',
      videoUrls: [],
      imageUrl: null,
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

function extractSection(text: string, sectionName: string): string {
  // Try multiple patterns to extract section content
  const patterns = [
    // Pattern for "Section: content" format
    new RegExp(`"?${sectionName}"?\\s*[:\\-]\\s*"?([^"\\n]+(?:\\n(?![A-Z][a-z]+:)[^"\\n]+)*)"?`, 'i'),
    // Pattern for JSON-like format
    new RegExp(`"${sectionName}"\\s*:\\s*"([^"]+)"`, 'i'),
    // Pattern for markdown headers
    new RegExp(`#+\\s*${sectionName}[^\\n]*\\n([^#]+)`, 'i'),
    // Simple colon pattern
    new RegExp(`${sectionName}[:\\s]+(.+?)(?=\\n[A-Z]|$)`, 'is')
  ];
  
  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  
  return '';
}

function getPopularCrops() {
  return [
    { id: '1', cropName: 'Wheat', overview: 'Major cereal crop grown in winter season (Rabi). Essential for making flour, bread, and chapati.', imageUrl: null, yield: '40-50 quintals/hectare' },
    { id: '2', cropName: 'Rice', overview: 'Staple food crop requiring high water. Grown extensively during monsoon (Kharif) season.', imageUrl: null, yield: '50-60 quintals/hectare' },
    { id: '3', cropName: 'Cotton', overview: 'Important cash crop for textile industry. Known as "White Gold" of agriculture.', imageUrl: null, yield: '20-25 quintals/hectare' },
    { id: '4', cropName: 'Sugarcane', overview: 'Commercial crop for sugar production. Long duration crop (12-18 months).', imageUrl: null, yield: '700-900 quintals/hectare' },
    { id: '5', cropName: 'Maize', overview: 'Versatile crop used for food, feed, and industrial purposes. Can be grown in all seasons.', imageUrl: null, yield: '60-70 quintals/hectare' },
    { id: '6', cropName: 'Potato', overview: 'High-value vegetable crop. Most widely consumed vegetable in India.', imageUrl: null, yield: '250-300 quintals/hectare' },
    { id: '7', cropName: 'Tomato', overview: 'Popular vegetable with good market demand. Requires moderate temperatures for best yield.', imageUrl: null, yield: '300-400 quintals/hectare' },
    { id: '8', cropName: 'Onion', overview: 'Essential vegetable with export potential. Stores well and has good shelf life.', imageUrl: null, yield: '200-250 quintals/hectare' },
    { id: '9', cropName: 'Soybean', overview: 'Important oilseed and protein crop. Good for crop rotation and soil health.', imageUrl: null, yield: '15-20 quintals/hectare' },
    { id: '10', cropName: 'Groundnut', overview: 'Major oilseed crop also known as peanut. Used for oil extraction and food.', imageUrl: null, yield: '20-25 quintals/hectare' },
    { id: '11', cropName: 'Mustard', overview: 'Important Rabi oilseed crop. Used for oil and as condiment in Indian cuisine.', imageUrl: null, yield: '15-18 quintals/hectare' },
    { id: '12', cropName: 'Chickpea', overview: 'Major pulse crop (Chana). High protein content and drought tolerant.', imageUrl: null, yield: '15-20 quintals/hectare' }
  ];
}
