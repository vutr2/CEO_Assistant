import { authMiddleware } from '@descope/nextjs-sdk/server';

export default authMiddleware({
  projectId: process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID,

  // Public routes — no auth required
  publicRoutes: [
    '/',
    '/login',
    '/register',
    '/pricing',
    // VNPay server-to-server callbacks (no user session)
    '/api/payment/ipn',
    '/api/payment/callback',
  ],

  redirectUrl: '/login',
});

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
