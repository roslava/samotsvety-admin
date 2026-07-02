import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Если это административный путь (кроме логина)
  if (pathname.startsWith('/admin') && !pathname.includes('/login')) {
    // Клиент-сайд, у нас нет доступа к localStorage здесь
    // Поэтому просто пропустим, клиент сам перенаправит если нужно
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
