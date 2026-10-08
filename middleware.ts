import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/showcase'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. Unauthenticated users trying to access protected routes -> redirect to /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users trying to access /login or /register -> redirect to dashboard/home
  if (token && (pathname === '/login' || pathname === '/register')) {
    const role = request.cookies.get('user_role')?.value;
    const dest = role === 'ADMIN' ? '/dashboard' : (role === 'TEACHER' || role === 'SUPERVISOR' || role === 'GUARDIAN') ? '/students' : '/';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static asset files (.svg, .png, .jpg, .jpeg, .webp, .gif, .ico, fonts, css, js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|woff|woff2|ttf|css|js)$).*)',
  ],
};
