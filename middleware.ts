import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes and their required roles
const protectedRoutes = {
  // Property routes
  '/properties/create': ['AGENT', 'ADMIN'],
  '/properties/manage': ['AGENT', 'ADMIN'],
  '/properties/private': ['AGENT', 'ADMIN'],
  
  // Service routes
  '/services/create': ['USER', 'AGENT', 'ADMIN'],
  '/services/manage': ['USER', 'AGENT', 'ADMIN'],
  
  // Leisure routes
  '/leisure/create': ['USER', 'AGENT', 'ADMIN'],
  '/leisure/manage': ['USER', 'AGENT', 'ADMIN'],
  
  // Admin routes
  '/admin': ['ADMIN'],
  '/admin/users': ['ADMIN'],
  '/admin/properties': ['ADMIN'],
  '/admin/services': ['ADMIN'],
  '/admin/leisure': ['ADMIN'],
  '/admin/analytics': ['ADMIN'],
  
  // Agent routes
  '/agent': ['AGENT', 'ADMIN'],
  '/agent/dashboard': ['AGENT', 'ADMIN'],
  '/agent/listings': ['AGENT', 'ADMIN'],
  '/agent/clients': ['AGENT', 'ADMIN'],
  
  // Verification required routes
  '/private-marketplace': ['USER', 'AGENT', 'ADMIN'],
  '/messages': ['USER', 'AGENT', 'ADMIN'],
  '/connect': ['USER', 'AGENT', 'ADMIN'],
} as const;

// Define routes that require identity verification
const verificationRequiredRoutes = [
  '/private-marketplace',
  '/messages',
  '/connect',
  '/properties/create',
  '/services/create',
  '/leisure/create',
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Check if the path requires authentication
  const path = request.nextUrl.pathname;
  
  // Allow public routes and static files
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/public') ||
    path === '/' ||
    path === '/auth/signin' ||
    path === '/auth/signup'
  ) {
    return NextResponse.next();
  }

  // Redirect to signin if not authenticated
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(signInUrl);
  }

  // Check role-based access for protected routes
  const userRole = token.role as keyof typeof protectedRoutes;
  
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (path.startsWith(route) && !allowedRoles.includes(userRole)) {
      // If unauthorized, redirect to home page with error message
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(homeUrl);
    }
  }

  // Check verification status for routes that require it
  if (
    verificationRequiredRoutes.some(route => path.startsWith(route)) &&
    !token.isVerified
  ) {
    return NextResponse.redirect(new URL('/verify-identity', request.url));
  }

  // Add user info to headers for API routes
  if (path.startsWith('/api')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.sub as string);
    requestHeaders.set('x-user-role', userRole);
    requestHeaders.set('x-user-verified', token.isVerified ? 'true' : 'false');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};