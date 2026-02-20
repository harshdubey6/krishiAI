import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { suggestCropDetailsFromImage } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  const session = await validateSession();
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { image, language = 'en' } = await req.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'Image is required' },
        { status: 400 }
      );
    }

    const suggestion = await suggestCropDetailsFromImage(image, String(language || 'en'));

    return NextResponse.json(
      {
        status: 'success',
        data: suggestion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Autofill crop details error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate crop details';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
