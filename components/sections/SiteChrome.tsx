import type { ReactNode } from 'react'
import { Footer, Nav } from '@/components/ui'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getSiteSettings } from '@/lib/sanity/queries'
import type { SiteSettings } from '@/lib/sanity/types'

export type SiteChromeProps = {
  locale: Locale
  /** path corrente SENZA prefisso locale (es. '/', '/academy') */
  path: string
  /** true per pagine con hero petrolio (Nav dark) */
  dark?: boolean
  children: ReactNode
}

/** shopUrl con la catena di fallback del progetto */
export function shopHref(settings: SiteSettings | null | undefined): string {
  return settings?.shopUrl ?? process.env.NEXT_PUBLIC_SHOP_URL ?? '#'
}

/**
 * Chrome condiviso del sito: Nav fixed in alto, Footer in basso,
 * la pagina in mezzo. Server component: carica siteSettings e dizionario.
 */
export async function SiteChrome({
  locale,
  path,
  dark = false,
  children,
}: SiteChromeProps) {
  const t = getDictionary(locale)
  const settings = await getSiteSettings()

  const items = [
    { label: t.nav.academy, href: localeHref(locale, '/academy') },
    { label: t.nav.studio, href: localeHref(locale, '/studios') },
    { label: t.nav.coworking, href: localeHref(locale, '/coworking') },
    { label: t.nav.innovation, href: localeHref(locale, '/innovazione') },
    { label: t.nav.magazine, href: localeHref(locale, '/magazine') },
    { label: t.nav.about, href: localeHref(locale, '/chi-siamo') },
  ]

  const clean = path.startsWith('/') ? path : `/${path}`
  const langHrefs = {
    it: clean,
    en: clean === '/' ? '/en' : `/en${clean}`,
  }

  const contactLines = [
    settings?.address ?? t.footer.address,
    settings?.phone,
    settings?.email,
  ].filter((line): line is string => Boolean(line))

  const social =
    settings?.social
      ?.filter((s) => s.label && s.url)
      .map((s) => ({ label: s.label as string, href: s.url as string, external: true })) ??
    []

  return (
    <>
      <Nav
        items={items}
        locale={locale}
        langHrefs={langHrefs}
        bookHref={shopHref(settings)}
        bookLabel={t.nav.book}
        bookExternal
        homeHref={localeHref(locale, '/')}
        dark={dark}
        menuLabel={t.nav.menu}
        langLabel={t.nav.lang}
      />
      {children}
      <Footer
        contactLines={contactLines}
        groups={[
          { links: items.slice(0, 3) },
          { links: items.slice(3) },
        ]}
        social={social}
        copyright={t.footer.copyright}
        legal={[
          { label: t.footer.privacy, href: '#' },
          { label: t.footer.cookie, href: '#' },
          { label: t.footer.transparency, href: '#' },
        ]}
        homeHref={localeHref(locale, '/')}
      />
    </>
  )
}
