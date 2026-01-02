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
  } catch (error: any) {
    console.error('Crop guide API error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to fetch crop guide'
    }, { status: 500 });
  }
}

// Generate crop guide using AI (fallback)
async function generateCropGuide(cropName: string) {
  // Import Gemini only when needed
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Generate a comprehensive farming guide for ${cropName} in India. Provide detailed information in the following structure:

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

Format each section clearly. Use bullet points where appropriate. Include both English and Hindi (in parentheses) for key terms. Keep it practical and farmer-friendly.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse the response into structured format
  return {
    id: 'ai-generated',
    cropName: cropName,
    overview: extractSection(text, 'Overview'),
    climate: extractSection(text, 'Climate'),
    soilType: extractSection(text, 'Soil Type'),
    sowing: extractSection(text, 'Sowing'),
    irrigation: extractSection(text, 'Irrigation'),
    fertilizer: extractSection(text, 'Fertilizer'),
    pests: extractSection(text, 'Pests'),
    diseases: extractSection(text, 'Diseases'),
    harvesting: extractSection(text, 'Harvesting'),
    yield: extractSection(text, 'Yield'),
    videoUrls: [],
    imageUrl: null,
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}[:\\s]*(.*?)(?=\\n\\n[A-Z]|$)`, 'is');
  const match = text.match(regex);
  return match ? match[1].trim() : `Information about ${sectionName.toLowerCase()} will be added soon.`;
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
