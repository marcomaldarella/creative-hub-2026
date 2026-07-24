import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// i18n routing: IT alla radice (/academy), EN con prefisso (/en/academy).
// /it/* espliciti vengono rediretti alla versione senza prefisso (URL canonico unico).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Sanity Studio (ora /admin) e API restano fuori dall'i18n
  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // vecchio percorso dello Studio: redirect al nuovo
  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/studio/, '/admin')
    return NextResponse.redirect(url, 308)
  }

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
  // esclude asset statici e file; studio/api gestiti nella funzione
  matcher: ['/((?!_next|.*\\..*).*)'],
}
