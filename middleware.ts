import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/compatibility', '/Q&A', '/ai-counseling', '/pricing', '/profile/:path*', '/profile-complete']
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in page
  if (token && (url.pathname.startsWith('/sign-in')  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check profile completion status from the token (if you store this info in the token)
  if (token && url.pathname.startsWith('/profile-complete')) {
    // You need to store profileCompleted in the token during session creation
    // This example assumes you have profileCompleted in the token
    const profileCompleted = (token as any).profileCompleted;
    
    if (profileCompleted) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // else return NextResponse.redirect(new URL('/profile-complete', request.url));
  }

  

  // Redirect unauthenticated users trying to access protected routes
  if (!token && (
    url.pathname.startsWith('/dashboard') || 
    url.pathname.startsWith('/compatibility') || 
    url.pathname.startsWith('/Q&A') ||
    url.pathname.startsWith('/ai-counseling') || 
    url.pathname.startsWith('/profile') || 
    url.pathname.startsWith('/pricing') ||
    url.pathname.startsWith('/profile-complete')
  )) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}