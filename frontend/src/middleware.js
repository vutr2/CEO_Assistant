import { NextResponse } from 'next/server';

export function middleware(request) {
  // Allow all routes to proceed
  // Auth is handled client-side via Descope React SDK
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
