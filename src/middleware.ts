import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Verify the token and allow access to protected routes
    const token = req.nextauth.token;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/diagnose/:path*',
    '/plant-db/:path*',
    '/farm-tips/:path*',
    '/weather/:path*',
  ],
};
