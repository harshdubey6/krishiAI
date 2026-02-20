import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // Match the cookie name used in authOptions (non-https = dev cookie name)
    cookieName: req.nextUrl.protocol === 'https:'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
  });

  if (!token) {
    // Redirect unauthenticated users to home with the sign-up modal open
    const signupUrl = new URL('/', req.url);
    signupUrl.searchParams.set('auth', 'register');
    signupUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signupUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
