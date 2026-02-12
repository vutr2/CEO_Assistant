import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Check if this is an OAuth callback (has code or descope parameter)
  const isOAuthCallback =
    searchParams.has('code') ||
    searchParams.has('descope-login') ||
    pathname === '/login';

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/dashboard', '/settings'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // For now, allow all routes to proceed
  // We'll handle auth protection in the client side
  return NextResponse.next();

  /* Commented out middleware protection - will re-enable after testing
  // Get session token from cookies
  const sessionToken = request.cookies.get('DS');

  // Allow OAuth callback to proceed without redirecting
  if (isOAuthCallback) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected routes
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login page (not callback), redirect to dashboard
  if (sessionToken && pathname === '/login' && !isOAuthCallback) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
  */
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
