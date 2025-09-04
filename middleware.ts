import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/private-marketplace',
  '/messages',
  '/profile',
  '/settings',
  '/create-listing',
  '/analytics',
];

// Paths that require agent verification
const agentPaths = [
  '/private-marketplace/submit-interest',
  '/create-listing',
  '/analytics',
];

// Paths that are only accessible when not authenticated
const authPaths = ['/auth/signin', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Check if the path requires agent verification
  const isAgentPath = agentPaths.some((path) => pathname.startsWith(path));

  // Check if the path is an auth path
  const isAuthPath = authPaths.some((path) => pathname === path);

  // Redirect to signin if accessing protected path without auth
  if (isProtectedPath && !token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing auth paths while authenticated
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check agent verification for agent-only paths
  if (isAgentPath && token) {
    const isVerifiedAgent = token.role === 'AGENT' && token.isVerified === true;
    if (!isVerifiedAgent) {
      // Redirect to agent verification page if not verified
      return NextResponse.redirect(
        new URL('/profile/verify-agent', request.url)
      );
    }
  }

  // API route protection
  if (pathname.startsWith('/api')) {
    // Protect private marketplace endpoints
    if (pathname.startsWith('/api/private-marketplace') && !token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401 }
      );
    }

    // Protect agent-only endpoints
    if (
      pathname.startsWith('/api/agent') &&
      (!token || token.role !== 'AGENT')
    ) {
      return new NextResponse(
        JSON.stringify({ message: 'Agent access required' }),
        { status: 403 }
      );
    }

    // Protect admin-only endpoints
    if (
      pathname.startsWith('/api/admin') &&
      (!token || token.role !== 'ADMIN')
    ) {
      return new NextResponse(
        JSON.stringify({ message: 'Admin access required' }),
        { status: 403 }
      );
    }
  }

  // Add user info to headers for logging/debugging
  if (token) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.id);
    requestHeaders.set('x-user-role', token.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /favicon.ico (favicon file)
     * 4. /public (public files)
     */
    '/((?!_next|static|favicon.ico|public).*)',
  ],
};