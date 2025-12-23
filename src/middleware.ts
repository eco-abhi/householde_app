import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // TEMPORARY: Disable auth for testing iframe
    // TODO: Re-enable authentication after iframe is working
    return NextResponse.next();

    /*
    // Check if user is authenticated
    const authCookie = request.cookies.get('household-auth');
    
    // Allow access to login page, API routes, and static files
    if (
      request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/icon.svg') ||
      request.nextUrl.pathname.startsWith('/manifest.json')
    ) {
      return NextResponse.next();
    }
    
    // Check if authenticated
    if (!authCookie || authCookie.value !== process.env.AUTH_SECRET) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.next();
    */
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
