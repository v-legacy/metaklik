import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function oldMiddleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /dashboard, /dashboard/links)
  const path = request.nextUrl.pathname;

  return NextResponse.next();
  // Debug logging
  console.log('🔒 Middleware running for path:', path);

  // Define protected routes that require authentication
  const isProtectedRoute = path.startsWith('/dashboard');

  // if (isProtectedRoute) {
  //   return NextResponse.redirect(new URL('/maintenance', request.url));
  // }
  // Check if user is authenticated (you can check cookies, tokens, etc.)
  // For now, we'll check for a simple auth token in cookies
  const token = request.cookies.get('auth-token')?.value;

  console.log('🔑 Is protected route:', isProtectedRoute);
  console.log('🍪 Auth token:', token ? 'EXISTS' : 'NOT FOUND');

  // If accessing protected route and not authenticated, redirect to signin
  if (isProtectedRoute && !token) {
    console.log('❌ Redirecting to signin - no auth token');
    const signInUrl = new URL('/signin', request.url);
    // Add callback URL to redirect back after signin
    signInUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(signInUrl);
  }

  // If authenticated and trying to access signin, redirect to dashboard
  if (token && path === '/signin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  // If authenticated and accessing protected route, allow
  if (token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// --- NEW NEXTAUTH MIDDLEWARE ---
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin",
  },
});

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/dashboard/:path*', '/signin'],
};
