import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// i18n routing: IT alla radice (/academy), EN con prefisso (/en/academy).
// /it/* espliciti vengono rediretti alla versione senza prefisso (URL canonico unico).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Sanity Studio e API restano fuori dall'i18n (confronto esatto sul segmento:
  // /studios è una pagina del sito e DEVE passare dal rewrite)
  if (
    pathname === '/studio' ||
    pathname.startsWith('/studio/') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
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
