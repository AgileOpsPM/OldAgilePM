import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // If the user is trying to access auth pages (/login, /register)
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    // And they ARE already logged in (they have a token)
    if (token) {
      // Redirect them to the dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Otherwise, let them proceed
    return NextResponse.next();
  }

  // Protect the dashboard page
  if (pathname.startsWith('/dashboard')) {
    // If the user is NOT logged in (they have no token)
    if (!token) {
      // Redirect them to the login page
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // Otherwise, let them proceed
    return NextResponse.next();
  }

  // Allow all other requests to go through
  return NextResponse.next();
}

// This configures the middleware to run only on specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};