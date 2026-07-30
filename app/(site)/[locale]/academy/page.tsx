import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Anchors, Reveal, RevealGroup, Rule, SearchBox, SectionHeader } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { TeacherGrid } from '@/components/sections/TeacherGrid'
import { Thumb } from '@/components/sections/Thumb'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAllCourses, getAllTeachers } from '@/lib/sanity/queries'
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
  return { title: t.nav.academy, description: t.academy.lede }
}

export default async function AcademyPage({
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

  const [courses, teachers] = await Promise.all([
    getAllCourses(),
    getAllTeachers(),
  ])

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

  const basePath = localeHref(locale, '/academy')

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
    <SiteChrome locale={locale} path="/academy">
      <main className={styles.main}>
        {/* ————— header ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal as="span" className={`mono ${styles.kicker}`}>
            {t.academy.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
            {t.academy.title}
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={160}>
            {t.academy.lede}
          </Reveal>
        </header>

        <Anchors
          ids={[
            'corsi-universitari',
            'formazione-finanziata',
            'stage-placement',
            'corsi-custom',
            'open-day',
            'servizi-studenti',
          ]}
        />

        {/* ————— filtri categoria ————— */}
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
              {filtered.map((course, i) => {
                const meta = [
                  l(course.duration, locale),
                  l(course.startDate, locale),
                  l(course.mode, locale),
                ]
                  .filter(Boolean)
                  .map((s) => s?.toLowerCase())
                  .join(' · ')
                return (
                  <Link
                    key={course._id}
                    href={`${basePath}/${course.slug?.current ?? ''}`}
                    className={`rv ${styles.course}`}
                    style={{ '--rvd': `${(i % 3) * 60}ms` } as CSSProperties}
                  >
                    <Thumb image={course.coverImage} index={i} ratio="3 / 4" />
                    <div className={styles.courseBody}>
                      <span className={`mono ${styles.courseKicker}`}>
                        {l(course.category?.title, locale)?.toLowerCase()}
                      </span>
                      <h3 className={styles.courseTitle}>
                        {l(course.title, locale)}
                      </h3>
                      <p className={styles.courseSummary}>
                        {l(course.summary, locale)}
                      </p>
                      {meta && <span className={`mono ${styles.courseMeta}`}>{meta}</span>}
                    </div>
                  </Link>
                )
              })}
            </RevealGroup>
          )}
        </section>

        <Rule left={t.academy.kicker} right={t.academy.teachersKicker} />

        {/* ————— docenti ————— */}
        <section className={`wrap ${styles.teachersSez}`}>
          <SectionHeader
            kicker={t.academy.teachersKicker}
            title={t.academy.teachersTitle}
          />
          <TeacherGrid teachers={teachers} locale={locale} variant="strip" />
        </section>
      </main>
    </SiteChrome>
  )
}
