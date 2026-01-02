import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { analyzePlantImage } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
export const maxBodySize = '10mb';

export async function POST(req: NextRequest) {
  // Validate session
  const session = await validateSession();
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const data = await req.json();
    const { image, cropType, symptoms, language = 'en' } = data;

    if (!image || !cropType || !symptoms) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Missing required fields',
        }),
        { status: 400 }
      );
    }

    // Get diagnosis from Gemini API
    const aiResult = await analyzePlantImage(image, cropType, symptoms);

    // Ensure we have an authenticated user id
    const userId = (session as any)?.user?.id;
    if (!userId) {
      return NextResponse.json({ status: 'error', message: 'User not authenticated' }, { status: 401 });
    }

    // Verify user ID is in the correct format
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Invalid user ID' 
      }, { status: 400 });
    }

    // Store image URL separately to avoid overly long URLs
    const imageUrl = `plant-image-${Date.now()}.jpg`;

    // First verify we can find the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Create diagnosis with proper typing
    const diagnosisInput = {
      userId: user.id,
      cropType: String(cropType || '').slice(0, 100),
      symptoms: String(symptoms || '').slice(0, 500),
      imageUrl: imageUrl,
      diagnosis: aiResult.diagnosis ? String(aiResult.diagnosis).slice(0, 1000) : null,
      severity: aiResult.severity || 'moderate',
      confidence: aiResult.confidence || 75,
      estimatedCost: aiResult.estimatedCost || null,
      language: language,
      causes: Array.isArray(aiResult.causes) 
        ? aiResult.causes.map(c => String(c).slice(0, 200)).slice(0, 10)
        : [],
      treatment: Array.isArray(aiResult.treatment)
        ? aiResult.treatment.map(t => String(t).slice(0, 200)).slice(0, 10)
        : [],
      prevention: Array.isArray(aiResult.prevention)
        ? aiResult.prevention.map(p => String(p).slice(0, 200)).slice(0, 10)
        : []
    };

    let savedDiagnosis;
    try {
      // Create the diagnosis
      savedDiagnosis = await prisma.diagnosis.create({
        data: diagnosisInput as any,
      });
    } catch (dbError) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to save diagnosis',
        debug: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      data: {
        id: savedDiagnosis.id,
        diagnosis: aiResult.diagnosis ?? null,
        causes: aiResult.causes ?? [],
        treatment: aiResult.treatment ?? [],
        prevention: aiResult.prevention ?? [],
        messages: [],
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Diagnosis error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process plant diagnosis';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
