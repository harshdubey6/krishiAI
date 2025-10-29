import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { chatWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const session = await validateSession();
  if (session instanceof NextResponse) return session;

  try {
    const { diagnosisId, message } = await req.json();
    if (!diagnosisId || !message) {
      return NextResponse.json({ status: 'error', message: 'Missing fields' }, { status: 400 });
    }

    const userId = (session as any)?.user?.id;
    if (!userId) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

    const diagnosis = await (prisma as any).diagnosis.findFirst({
      where: { id: diagnosisId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!diagnosis) {
      return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
    }

    // save user's message
    const userMsg = await prisma.chatMessage.create({ data: { diagnosisId, role: 'user', content: message } as any });

    // Build history for AI from previous messages + the new user message
    const history = (diagnosis.messages || []).map((m: any) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: message });

    // Ask Gemini for a reply
    const reply = await chatWithGemini(history, message);

    // save assistant reply
    const assistantMsg = await prisma.chatMessage.create({ data: { diagnosisId, role: 'assistant', content: reply } as any });

    return NextResponse.json({ status: 'success', data: { reply, userMessage: userMsg, assistantMessage: assistantMsg } }, { status: 200 });
  } catch (error) {
    console.error('Chat error', error);
    return NextResponse.json({ status: 'error', message: 'Failed to process message' }, { status: 500 });
  }
}
