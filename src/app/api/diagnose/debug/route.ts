import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { analyzePlantImage } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxBodySize = '10mb';

export async function POST(req: NextRequest) {
  // Require auth so only dev/testers call this in your environment
  const session = await validateSession();
  if (session instanceof NextResponse) return session;

  try {
    const { image, plantType = 'Unknown', symptoms = 'None' } = await req.json();
    if (!image) return NextResponse.json({ status: 'error', message: 'Missing image in body' }, { status: 400 });

    // Call the gemini helper and return raw/parsed results for debugging
    try {
      const ai = await analyzePlantImage(image, plantType, symptoms);
      return NextResponse.json({ status: 'success', raw: ai, parsed: ai }, { status: 200 });
    } catch (aiErr) {
      // analyzePlantImage throws with a helpful message (we included raw response in error)
      const message = aiErr instanceof Error ? aiErr.message : String(aiErr);
      console.error('Gemini debug call failed:', message);
      return NextResponse.json({ status: 'error', message }, { status: 500 });
    }
  } catch (err) {
    console.error('Debug endpoint error:', err);
    return NextResponse.json({ status: 'error', message: 'Failed to parse request or run debug' }, { status: 500 });
  }
}
