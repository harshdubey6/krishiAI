import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { chatWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const session = await validateSession();
  if (session instanceof NextResponse) return session;

  try {
    const { diagnosisId, message, language } = await req.json();
    if (!diagnosisId || !message) {
      return NextResponse.json({ status: 'error', message: 'Missing fields' }, { status: 400 });
    }

    const userId = (session as {user?: {id?: string}})?.user?.id;
    if (!userId) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

    const diagnosis = await prisma.diagnosis.findFirst({
      where: { id: diagnosisId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!diagnosis) {
      return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
    }

    // save user's message
    const userMsg = await prisma.chatMessage.create({ data: { diagnosisId, role: 'user', content: message } });

    // Build history for AI from previous messages only (newMessage is sent separately)
    const history = (diagnosis.messages || []).map((m: {role: string; content: string}) => ({ role: m.role, content: m.content }));

    const diagnosisContext = [
      `Crop Type: ${diagnosis.cropType || 'Unknown'}`,
      `Symptoms: ${diagnosis.symptoms || 'Not provided'}`,
      `Diagnosis: ${diagnosis.diagnosis || 'Not available'}`,
      `Severity: ${diagnosis.severity || 'Unknown'}`,
      `Confidence: ${typeof diagnosis.confidence === 'number' ? `${diagnosis.confidence}%` : 'Unknown'}`,
      `Estimated Cost: ${typeof diagnosis.estimatedCost === 'number' ? `₹${diagnosis.estimatedCost}` : 'N/A'}`,
      `Causes: ${Array.isArray(diagnosis.causes) && diagnosis.causes.length > 0 ? diagnosis.causes.join('; ') : 'N/A'}`,
      `Treatment: ${Array.isArray(diagnosis.treatment) && diagnosis.treatment.length > 0 ? diagnosis.treatment.join('; ') : 'N/A'}`,
      `Prevention: ${Array.isArray(diagnosis.prevention) && diagnosis.prevention.length > 0 ? diagnosis.prevention.join('; ') : 'N/A'}`,
    ].join('\n');

    // Ask Gemini for a reply
    const reply = await chatWithGemini(
      history,
      message,
      String(language || diagnosis.language || 'en'),
      diagnosisContext
    );

    // save assistant reply
    const assistantMsg = await prisma.chatMessage.create({ data: { diagnosisId, role: 'assistant', content: reply } });

    return NextResponse.json({ status: 'success', data: { reply, userMessage: userMsg, assistantMessage: assistantMsg } }, { status: 200 });
  } catch (error) {
    console.error('Chat error', error);
    return NextResponse.json({ status: 'error', message: 'Failed to process message' }, { status: 500 });
  }
}
