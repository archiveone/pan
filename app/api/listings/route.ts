import { NextResponse } from 'next/server';

// Redirect all /api/listings requests to /api/properties
export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectUrl = url.href.replace('/api/listings', '/api/properties');
  return NextResponse.redirect(redirectUrl);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const redirectUrl = url.href.replace('/api/listings', '/api/properties');
  return NextResponse.redirect(redirectUrl);
}

export async function PATCH(req: Request) {
  const url = new URL(req.url);
  const redirectUrl = url.href.replace('/api/listings', '/api/properties');
  return NextResponse.redirect(redirectUrl);
}

// Add a deprecation notice in the response headers
export function middleware(req: Request) {
  const response = NextResponse.next();
  response.headers.set(
    'Warning',
    '299 - "The /api/listings endpoint is deprecated. Please use /api/properties instead."'
  );
  return response;
}