import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLink,
  Reveal,
  RevealGroup,
  ScrollerRow,
  SearchBox,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { Thumb } from '@/components/sections/Thumb'
/* stesse card a foto piena della landing universitari (layout B):
   il modulo si condivide, la UI resta UNA */
import uni from '@/components/sections/UniScreen.module.css'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getAllCourses } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import { matchesQuery } from '@/lib/search'
import { courseHref } from '@/lib/courses'
import styles from './page.module.css'

/* cover di riserva per i corsi senza foto in Sanity: le stesse della
   landing academy, a giro */
const FALLBACK_PHOTOS = [
  '/img/foto/studio-ssl.jpg',
  '/img/foto/live-band.jpg',
  '/img/sections/node-innovazione.jpg',
  '/img/sections/studio-regia-b.jpg',
  '/img/sections/studio-regia.jpg',
  '/img/foto/sede.jpg',
] as const

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: `${t.academy.backToCourses} — ${t.nav.academy}`,
    description: t.academy.lede,
    alternates: pageAlternates(locale, '/academy/corsi'),
  }
}

export default async function CorsiPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const { categoria, tipo, q } = await searchParams
  const active = typeof categoria === 'string' ? categoria : undefined
  const activeType = typeof tipo === 'string' ? tipo : undefined
  const query = typeof q === 'string' ? q : undefined

  const courses = await getAllCourses()

  // categorie derivate dai corsi (uniche, in ordine di apparizione)
  const categories: { slug: string; label: string }[] = []
  for (const course of courses) {
    const slug = course.category?.slug?.current
    const label = l(course.category?.title, locale)
    if (slug && label && !categories.some((c) => c.slug === slug)) {
      /* l'etichetta resta com'è scritta in Sanity (iniziale maiuscola):
         schiacciata in minuscolo stonava accanto alle pill delle altre
         sezioni, che la maiuscola ce l'hanno */
      categories.push({ slug, label })
    }
  }

  /* ordine mescolato ma DETERMINISTICO (niente random: è un server
     component): round-robin fra le categorie, così i corsi della stessa
     categoria — che da Sanity arrivano vicini e in ordine alfabetico —
     non si affiancano mai in griglia */
  const byCat = new Map<string, typeof courses>()
  for (const c of courses) {
    const k = c.category?.slug?.current ?? '~'
    if (!byCat.has(k)) byCat.set(k, [])
    byCat.get(k)!.push(c)
  }
  const pools = [...byCat.values()]
  const mixed: typeof courses = []
  for (let i = 0; mixed.length < courses.length; i++) {
    for (const pool of pools) if (pool[i]) mixed.push(pool[i])
  }

  const byCategory = active
    ? mixed.filter((c) => c.category?.slug?.current === active)
    : mixed
  const byType = activeType
    ? byCategory.filter((c) => c.types?.includes(activeType))
    : byCategory
  const filtered = byType.filter((c) =>
    matchesQuery(
      query,
      l(c.title, locale),
      l(c.summary, locale),
      l(c.category?.title, locale),
      l(c.duration, locale),
      l(c.mode, locale)
    )
  )

  const academyPath = localeHref(locale, '/academy')
  const basePath = localeHref(locale, '/academy/corsi')

  // href che preserva l'altro filtro attivo
  const filterHref = (cat?: string, type?: string) => {
    const sp = new URLSearchParams()
    if (cat) sp.set('categoria', cat)
    if (type) sp.set('tipo', type)
    const s = sp.toString()
    return s ? `${basePath}?${s}` : basePath
  }

  const typeOrder = ['magistrale', 'triennio', 'finanziato', 'gratuito', 'custom'] as const

  return (
    <SiteChrome locale={locale} path="/academy/corsi">
      <main className={styles.main}>
        {/* ————— header ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal className={styles.back}>
            <ArrowLink href={academyPath} reverse>
              {`${t.common.backTo} academy`}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
            {t.academy.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={120}>
            {t.academy.backToCourses}
          </Reveal>
        </header>

        {/* ————— fascia filtrabile: nera, le card restano nel colore ————— */}
        <div className={styles.filterBand}>
          <nav className={`wrap ${styles.filters}`} aria-label={t.academy.categoryLabel}>
            {/* le pill scorrono dentro la loro corsia: dodici filtri più
                il campo non entrano in una riga, e andando a capo il
                "cerca" si staccava dal gruppo */}
            <ScrollerRow
              as="div"
              tabIndex={0}
              className={styles.filterTrack}
              wrapClassName={styles.filterWrap}
              arrows={{ prev: t.nav.pagesPrev, next: t.nav.pagesNext }}
            >
            <Link
              href={filterHref(undefined, activeType)}
              scroll={false}
              className={!active ? `${styles.pill} ${styles.pillOn}` : styles.pill}
            >
              {t.common.all}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={filterHref(cat.slug, activeType)}
                scroll={false}
                className={
                  active === cat.slug
                    ? `${styles.pill} ${styles.pillOn}`
                    : styles.pill
                }
              >
                {cat.label}
              </Link>
            ))}
            <span className={styles.filterSep} aria-hidden="true" />
            {typeOrder.map((slug) => (
              <Link
                key={slug}
                href={filterHref(active, activeType === slug ? undefined : slug)}
                scroll={false}
                className={
                  activeType === slug
                    ? `${styles.pill} ${styles.pillOn}`
                    : styles.pill
                }
              >
                {t.academy.types[slug]}
              </Link>
            ))}
            </ScrollerRow>
            <SearchBox placeholder={t.common.search} className={styles.search} />
          </nav>
        </div>

        {/* ————— griglia corsi: dalla prima card in giù la pagina è
            NERA (testata e filtri restano azzurri) ————— */}
        <div className={`scheme-dark ${styles.gridBand}`}>
          <section className={`wrap ${styles.gridSez}`}>
            {filtered.length === 0 ? (
              <p className="mono">{t.academy.empty}</p>
            ) : (
              <RevealGroup className={uni.grid}>
                {filtered.map((course, i) => {
                  const ty = course.types?.[0] as
                    | keyof typeof t.academy.types
                    | undefined
                  const catLabel = l(course.category?.title, locale)
                  const meta = [
                    l(course.duration, locale),
                    l(course.mode, locale),
                  ].filter(Boolean) as string[]
                  return (
                    <Link
                      key={course._id}
                      /* i finanziati senza scheda atterrano sulla pagina
                         di categoria, mai su un 404 (lib/courses) */
                      href={courseHref(course, locale)}
                      className={`${uni.card} rv`}
                      style={{ '--rvd': `${(i % 3) * 60}ms` } as CSSProperties}
                    >
                      <figure className={uni.ph}>
                        <Thumb
                          image={course.coverImage}
                          index={i}
                          fill
                          /* senza cover Sanity si pesca dalle foto della
                             landing academy, a giro (28/10) */
                          fallbackSrc={FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length]}
                          alt={l(course.title, locale) ?? ''}
                        />
                      </figure>
                      {/* categoria e tipologia sulla stessa riga: ora
                          che la tipologia ha la maiuscola, schiacciare la
                          categoria in minuscolo lascerebbe due stili
                          affiancati */}
                      <div className={uni.cardTop}>
                        {catLabel && (
                          <span className={uni.area}>{catLabel}</span>
                        )}
                        {ty && (
                          <span className={uni.tag}>
                            {t.academy.types[ty] ?? ty}
                          </span>
                        )}
                      </div>
                      <h3 className={uni.cardTitle}>
                        {l(course.title, locale)}
                      </h3>
                      {l(course.summary, locale) && (
                        <p className={uni.cardDesc}>
                          {l(course.summary, locale)}
                        </p>
                      )}
                      {meta.length > 0 && (
                        <div className={uni.cardMeta}>
                          {meta.map((m, k) =>
                            k === 0 ? <b key={m}>{m}</b> : <span key={m}>{m}</span>
                          )}
                        </div>
                      )}
                      {/* freccia della card come nelle altre liste: SVG, mai unicode */}
                      <span className={uni.go}>
                        <span className={uni.goLabel}>{t.uni.goCta}</span>
                        <svg
                          viewBox="0 0 24 24"
                          width="15"
                          height="15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path d="M7 17 17 7M9 7h8v8" />
                        </svg>
                      </span>
                    </Link>
                  )
                })}
              </RevealGroup>
            )}
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
