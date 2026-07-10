import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// i18n routing: IT alla radice (/academy), EN con prefisso (/en/academy).
// /it/* espliciti vengono rediretti alla versione senza prefisso (URL canonico unico).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/it' || pathname.startsWith('/it/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/it/, '') || '/'
    return NextResponse.redirect(url, 308)
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = `/it${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // esclude studio Sanity, API route, asset statici e file
  matcher: ['/((?!api|studio|_next|.*\\..*).*)'],
}
