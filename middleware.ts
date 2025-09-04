import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require verification
const VERIFIED_ROUTES = [
  '/private-marketplace',
  '/create-listing',
  '/dashboard/agent',
];

// Routes that require authentication but not verification
const AUTH_ROUTES = [
  '/dashboard',
  '/messages',
  '/profile',
  '/settings',
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Check if user is authenticated
  if (!token && (AUTH_ROUTES.some(route => request.nextUrl.pathname.startsWith(route)) || 
      VERIFIED_ROUTES.some(route => request.nextUrl.pathname.startsWith(route)))) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Check verification status for protected routes
  if (VERIFIED_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))) {
    // @ts-ignore - we know these properties exist on our token
    if (token?.verificationStatus !== 'VERIFIED') {
      return NextResponse.redirect(
        new URL('/verify-identity', request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/private-marketplace/:path*',
    '/create-listing/:path*',
  ],
};