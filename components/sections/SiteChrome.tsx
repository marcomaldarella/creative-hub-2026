import type { ReactNode } from 'react'
import { Footer, Nav } from '@/components/ui'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getSiteSettings } from '@/lib/sanity/queries'
import { findTopic, type TopicBase } from '@/lib/topics'
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

/* accento di sezione: --accent per superfici/bordi, --accent-ink per il
   testo (il giallo fluo puro non regge su fondo chiaro: si mixa con l'ink) */
const SECTION_ACCENTS: Record<
  string,
  { accent: string; ink: string; on: string }
> = {
  /* ink = accento come TESTO (il blu brand è scuro: in dark si schiarisce
     via --azzurro-ink) · on = testo SOPRA una superficie in --accent */
  '/academy': {
    accent: 'var(--azzurro-fill)',
    ink: 'var(--azzurro-ink)',
    on: 'var(--osso)',
  },
  '/studios': {
    accent: 'var(--arancio)',
    ink: 'var(--arancio-ink)',
    on: 'var(--petrolio)',
  },
  '/coworking': {
    accent: 'var(--giallo-fluo)',
    ink: 'color-mix(in srgb, var(--giallo-fluo) 70%, var(--fg))',
    on: 'var(--petrolio)',
  },
}

function accentOf(path: string) {
  const base = Object.keys(SECTION_ACCENTS).find(
    (b) => path === b || path.startsWith(`${b}/`)
  )
  return base ? SECTION_ACCENTS[base] : undefined
}

/* 2026-09: le 3 sezioni non usano più un accento leggero su fondo
   neutro — TUTTO lo sfondo (nav, contenuto, footer) diventa il colore
   di sezione, testo sempre nero, niente più toggle light/dark (il
   colore è fisso, cambiare tema non farebbe nulla di visibile e
   confonderebbe). Studio e coworking riusano l'arancio/giallo fluo già
   in palette; l'academy prende un azzurro nuovo, più vivo del petrolio
   usato come inchiostro altrove (il petrolio scuro sotto testo nero
   sarebbe illeggibile). */
const FLOOD_SECTIONS: Record<string, string> = {
  '/academy': '#4C8DF0',
  '/studios': 'var(--arancio)',
  '/coworking': 'var(--giallo-fluo)',
}

function floodOf(path: string): string | undefined {
  const base = Object.keys(FLOOD_SECTIONS).find(
    (b) => path === b || path.startsWith(`${b}/`)
  )
  return base ? FLOOD_SECTIONS[base] : undefined
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
  /* una voce di menu può portare a: la sua pagina (lib/topics), un'ancora
     su una sezione reale della pagina indice, o la pagina indice stessa */
  const hrefSub = (base: string, anchor: string | null) => {
    if (!anchor) return base
    /* già un percorso (es. categoria/…) oppure una voce con pagina propria */
    if (anchor.includes('/') || findTopic(base as TopicBase, anchor)) {
      return `${base}/${anchor}`
    }
    return `${base}#${anchor}`
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
      /* le quattro linee editoriali sono pagine categoria vere */
      anchors: [
        'categoria/produzione-musicale',
        'categoria/industrie-creative',
        'categoria/formazione-carriera',
        'categoria/eventi-news',
      ],
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

  const clean = path.startsWith('/') ? path : `/${path}`
  const flood = floodOf(clean)

  const items = sections.map((s) => {
    const sub = t.nav.sub[s.key]
    const cross: Partial<Record<number, SectionKey>> = s.cross ?? {}
    /* da una pagina a colore pieno, solo il pannello della SEZIONE
       CORRENTE resta nel colore; gli altri vanno in fascia scura
       (nero, testi chiari) via darkPanel. L'inline style di NavItem è
       più vicino nel DOM del wrapper flood e vince, quindi l'accento
       va passato esplicito in entrambi i casi */
    const isCurrent = clean === s.base || clean.startsWith(`${s.base}/`)
    return {
      label: s.label,
      href: localeHref(locale, s.base),
      /* pannelli: quello della sezione corrente su pagina flood è a
         colore pieno con inchiostro nero; TUTTI gli altri sono neri con
         eyebrow e titolo nel colore pieno della LORO sezione (le voci
         senza colore — innovazione, editorial, chi siamo — in osso) */
      accent:
        flood && isCurrent
          ? { accent: flood, ink: '#000000', on: '#000000' }
          : {
              accent: FLOOD_SECTIONS[s.base] ?? 'var(--osso)',
              ink: FLOOD_SECTIONS[s.base] ?? 'var(--osso)',
              on: '#000000',
            },
      /* solo la voce della sezione corrente dipinge il suo pannello nel
         colore pieno; le altre restano nere (e fanno scivolare a nero
         anche la barra, vedi barToBlack in Nav) */
      floodPanel: flood && isCurrent ? flood : undefined,
      sub: {
        eyebrow: `/${s.label.toLowerCase()}`,
        desc: sub.desc,
        explore: t.nav.explore,
        entries: sub.items.map((label, i) => {
          const anchor = s.anchors[i]
          const crossKey = cross[i]
          return {
            label,
            /* se la voce ha una pagina propria (lib/topics) si va lì;
               altrimenti resta l'ancora, che punta a una sezione vera
               della pagina indice */
            href: localeHref(locale, hrefSub(s.base, anchor)),
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

  const pageAccent = accentOf(clean)
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

  const nav = (
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
      topbar={{
        left: t.nav.topbar.left,
        middle: t.nav.topbar.middle,
        cta: t.nav.topbar.cta,
        ctaHref: shopHref(settings),
        phone: settings?.phone,
        email: settings?.email,
      }}
    />
  )

  const footer = (
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
        { label: t.footer.privacy, href: localeHref(locale, '/privacy') },
        { label: t.footer.cookie, href: localeHref(locale, '/cookie') },
        { label: t.footer.transparency, href: localeHref(locale, '/trasparenza') },
      ]}
      homeHref={localeHref(locale, '/')}
    />
  )

  if (flood) {
    /* pagina "a colore pieno": nav, contenuto e footer condividono lo
       stesso wrapper, così --bg/--fg/--surface/--line ridipingono TUTTO
       (Nav e Footer leggono già questi token, non serve toccarli).
       Niente qui dentro crea un containing block per il Nav fixed
       (solo custom properties): la barra resta ancorata al viewport. */
    return (
      <div
        style={
          {
            /* ⚠️ non bastano le custom property: <body>, sopra questo
               div nell'albero, dipinge il SUO sfondo con --bg del tema
               root (bianco/nero) — le custom property non risalgono.
               Senza un background VERO qui, ogni spazio vuoto di questa
               pagina (i gap tra le sezioni, sotto l'ultima) mostrava il
               nero di sfondo del body invece del colore di sezione. */
            background: flood,
            /* stesso motivo dello sfondo: il `color` va dichiarato QUI,
               non solo come custom property — altrimenti i titoli senza
               un `color: var(--fg)` esplicito (SectionHeader, Card…)
               ereditano il colore già calcolato su <body> (bianco, se il
               tema è dark) invece di rileggere il mio override */
            color: '#000000',
            minHeight: '100dvh',
            '--bg': flood,
            /* schede: STESSO colore dello sfondo (richiesta 2026-09-08) —
               a definirle basta il bordo in --line */
            '--surface': flood,
            '--panel': `color-mix(in srgb, #000000 24%, ${flood})`,
            '--fg': '#000000',
            /* testo secondario: nero SOLIDO (non trasparente) — un nero
               al 60% di opacità sopra --surface (già scurito) si fondeva
               nello sfondo invece di leggersi come testo */
            '--fg-2': '#141414',
            /* bordi/linee: nero a opacità ridotta — stesso "nero" del
               testo, non bianco (era la prima versione, sbagliata) e
               non nero pieno (troppo duro sulle superfici già scure) */
            '--line': 'rgba(0, 0, 0, 0.28)',
            /* --accent resta il colore di sezione PIENO (è il fill di
               CTA/pillOn esistenti, es. coworking "prenota un day pass":
               usarlo come nero rompeva quei componenti, che aspettano
               una superficie colorata con testo scuro sopra) */
            '--accent': flood,
            '--accent-ink': '#000000',
            '--accent-on': '#000000',
            /* didascalie delle foto piena pagina (Photo.tsx): normalmente
               chiare fisse su overlay scuro, qui devono restare nere */
            '--photo-caption': '#000000',
          } as React.CSSProperties
        }
      >
        {nav}
        {children}
        {footer}
      </div>
    )
  }

  return (
    <>
      {/* schema fisso (niente più toggle): il menu è SEMPRE in fascia
          scura sulle pagine neutre — il wrapper non crea containing
          block per il Nav fixed (solo classe, niente transform) */}
      <div className="scheme-dark">{nav}</div>
      {pageAccent ? (
        /* div NORMALE, non display:contents: senza box Next salta lo
           scroll-to-top alla navigazione e si resta a fondo pagina */
        <div
          style={
            {
              '--accent': pageAccent.accent,
              '--accent-ink': pageAccent.ink,
              '--accent-on': pageAccent.on,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      ) : (
        children
      )}
      {/* footer sempre nero, come il menu */}
      <div className="scheme-dark">{footer}</div>
    </>
  )
}
