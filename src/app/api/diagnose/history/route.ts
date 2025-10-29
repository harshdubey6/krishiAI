import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await validateSession();
  if (session instanceof NextResponse) return session;

  try {
    const items = await prisma.diagnosis.findMany({
      where: { userId: (session as any).user.id },
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return NextResponse.json({ status: 'success', items }, { status: 200 });
  } catch (error) {
    console.error('History error', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch history' }, { status: 500 });
  }
}


