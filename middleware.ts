import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req });
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

  // Public paths that don't require authentication
  const PUBLIC_PATHS = [
    '/',
    '/properties',
    '/services',
    '/about',
    '/contact',
  ];

  // API paths that don't require authentication
  const PUBLIC_API_PATHS = [
    '/api/properties',
    '/api/services',
  ];

  const isPublicPath = PUBLIC_PATHS.some(path => 
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`)
  );

  const isPublicApiPath = PUBLIC_API_PATHS.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Handle authentication pages
  if (isAuthPage) {
    if (isAuth) {
      // Redirect to dashboard if user is already authenticated
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Allow public paths and API endpoints
  if (isPublicPath || isPublicApiPath) {
    return NextResponse.next();
  }

  // Protected API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Protected pages
  if (!isAuth) {
    let callbackUrl = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      callbackUrl += req.nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, req.url)
    );
  }

  // Role-based access control
  if (token?.role) {
    // Agent-only routes
    const AGENT_ROUTES = ['/agent', '/properties/create'];
    const isAgentRoute = AGENT_ROUTES.some(path => 
      req.nextUrl.pathname.startsWith(path)
    );

    if (isAgentRoute && token.role !== 'AGENT') {
      return NextResponse.redirect(
        new URL('/dashboard?error=unauthorized', req.url)
      );
    }

    // Admin-only routes
    const ADMIN_ROUTES = ['/admin'];
    const isAdminRoute = ADMIN_ROUTES.some(path => 
      req.nextUrl.pathname.startsWith(path)
    );

    if (isAdminRoute && token.role !== 'ADMIN') {
      return NextResponse.redirect(
        new URL('/dashboard?error=unauthorized', req.url)
      );
    }
  }

  return NextResponse.next();
}

// Configure protected routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     * 4. public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};