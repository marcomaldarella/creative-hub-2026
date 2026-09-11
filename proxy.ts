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

  // vecchi mockup statici del template corso: ora sono pagine vere sotto
  // /academy, montate nel vero SiteChrome (nav/footer reali, non più
  // ricostruiti a mano) — redirect così i link già condivisi restano validi
  const MOCKUP_REDIRECTS: Record<string, string> = {
    '/mockup-corso/v1': '/academy/corso-v1',
    '/mockup-corso/v2': '/academy/corso-v2',
    '/mockup-corso/v3': '/academy/corso-v3',
  }
  if (pathname in MOCKUP_REDIRECTS) {
    const url = request.nextUrl.clone()
    url.pathname = MOCKUP_REDIRECTS[pathname]
    return NextResponse.redirect(url, 307)
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
