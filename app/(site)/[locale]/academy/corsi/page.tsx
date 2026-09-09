import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLink, Reveal, RevealGroup, SearchBox } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { CourseCard } from '@/components/sections/CourseCard'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAllCourses } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import { matchesQuery } from '@/lib/search'
import styles from './page.module.css'

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
      categories.push({ slug, label: label.toLowerCase() })
    }
  }

  const byCategory = active
    ? courses.filter((c) => c.category?.slug?.current === active)
    : courses
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
            <SearchBox placeholder={t.common.search} className={styles.search} />
          </nav>

          {/* ————— griglia corsi ————— */}
          <section className={`wrap ${styles.gridSez}`}>
            {filtered.length === 0 ? (
              <p className="mono">{t.academy.empty}</p>
            ) : (
              <RevealGroup className={styles.grid}>
                {filtered.map((course, i) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    locale={locale}
                    index={i}
                    href={`${academyPath}/${course.slug?.current ?? ''}`}
                    className="rv"
                    style={{ '--rvd': `${(i % 3) * 60}ms` } as CSSProperties}
                  />
                ))}
              </RevealGroup>
            )}
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
