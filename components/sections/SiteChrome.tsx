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

  // mega-menu: ancore stabili (non localizzate) per voce, nell'ordine
  // di t.nav.sub[key].items; null = link alla sezione senza hash
  type SectionKey = keyof typeof t.nav.sub
  type Section = {
    key: SectionKey
    label: string
    base: string
    anchors: (string | null)[]
    cross?: Record<number, SectionKey>
  }
  const sections: Section[] = [
    {
      key: 'academy',
      label: t.nav.academy,
      base: '/academy',
      anchors: [
        'corsi-universitari',
        'formazione-finanziata',
        'stage-placement',
        'corsi-custom',
        'open-day',
        'servizi-studenti',
      ],
    },
    {
      key: 'studio',
      label: t.nav.studio,
      base: '/studios',
      anchors: [
        'registrazione',
        'mix-mastering',
        'dolby-atmos',
        'sound-design',
        'podcast',
        'affitto-studio',
      ],
    },
    {
      key: 'coworking',
      label: t.nav.coworking,
      base: '/coworking',
      anchors: ['coworking', null, 'prenota', 'sale-eventi', 'metaverso'],
      cross: { 1: 'studio' },
    },
    {
      key: 'innovation',
      label: t.nav.innovation,
      base: '/innovazione',
      anchors: ['aziende', 'accelerazione', 'bandi', 'incubazione', 'cte-cobo'],
    },
    {
      key: 'magazine',
      label: t.nav.magazine,
      base: '/magazine',
      anchors: [null, null, null, null],
      cross: { 0: 'studio', 1: 'innovation', 2: 'academy', 3: 'coworking' },
    },
    {
      key: 'about',
      label: t.nav.about,
      base: '/chi-siamo',
      anchors: ['ecosistema', 'governance', 'contatti', 'team', 'partner'],
    },
  ]

  const baseOf = Object.fromEntries(sections.map((s) => [s.key, s.base]))
  const labelOf = Object.fromEntries(sections.map((s) => [s.key, s.label]))

  const items = sections.map((s) => {
    const sub = t.nav.sub[s.key]
    const cross: Partial<Record<number, SectionKey>> = s.cross ?? {}
    return {
      label: s.label,
      href: localeHref(locale, s.base),
      sub: {
        eyebrow: `/${s.label.toLowerCase()}`,
        desc: sub.desc,
        explore: t.nav.explore,
        entries: sub.items.map((label, i) => {
          const anchor = s.anchors[i]
          const crossKey = cross[i]
          return {
            label,
            href: localeHref(locale, anchor ? `${s.base}#${anchor}` : s.base),
            cross: crossKey
              ? {
                  label: `/${labelOf[crossKey]}`,
                  href: localeHref(locale, baseOf[crossKey]),
                }
              : undefined,
          }
        }),
      },
    }
  })

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
          { title: t.footer.colHub, links: items.slice(0, 3) },
          { title: t.footer.colEco, links: items.slice(3) },
        ]}
        social={social}
        socialTitle={t.footer.colSocial}
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
