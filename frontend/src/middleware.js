import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get session token from cookies
  const sessionToken = request.cookies.get('DS');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // If user is not authenticated and trying to access protected routes
  if (!sessionToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login page
  if (sessionToken && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
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
