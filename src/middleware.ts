import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    // Must match authOptions.pages.signIn — login UI is the home page with modal
    signIn: '/',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
