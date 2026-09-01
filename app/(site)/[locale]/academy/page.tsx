import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Arrow,
  Card,
  Reveal,
  RevealGroup,
  Rule,
  SearchBox,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { TeacherStrip } from '@/components/sections/TeacherStrip'
import { Thumb } from '@/components/sections/Thumb'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAllCourses, getAllTeachers, getSiteSettings } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import { matchesQuery } from '@/lib/search'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* le 3 card "scegli il tuo percorso": stessi filtri già usati sopra,
   ma come vetrina editoriale — slug della pagina topic + tipologie
   corso da contare (lib/topics.ts) */
const PATHS = [
  { slug: 'corsi-universitari', types: ['triennio', 'magistrale'] },
  { slug: 'corsi-custom', types: ['custom'] },
  { slug: 'formazione-finanziata', types: ['finanziato', 'gratuito'] },
] as const

/* la lista "tutto intorno allo studio": altre 3 pagine topic */
const AROUND = ['stage-placement', 'servizi-studenti', 'open-day'] as const

/** avvolge in <strong> i nomi propri dentro un paragrafo (Angela Madonia
 *  ecc.): evita di portare markup nei dizionari JSON. */
function withNames(text: string, names: string[]): ReactNode {
  if (names.length === 0) return text
  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'g')
  return text
    .split(re)
    .map((part, i) => (names.includes(part) ? <strong key={i}>{part}</strong> : part))
}

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

  const [courses, teachers, settings] = await Promise.all([
    getAllCourses(),
    getAllTeachers(),
    getSiteSettings(),
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
            {t.academy.titleLines[0]}{' '}
            <br className={styles.titleBreak} />
            {t.academy.titleLines[1]}
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={160}>
            {t.academy.lede}
          </Reveal>
        </header>

        {/* ————— scegli il tuo percorso ————— */}
        <section className={`wrap ${styles.pathsSez}`}>
          <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
            {t.academy.pathsKicker}
          </Reveal>
          <RevealGroup className={styles.pathsGrid}>
            {PATHS.map((path, i) => {
              const item = t.academy.pathsItems[i]
              const count = courses.filter((c) =>
                c.types?.some((ty) => (path.types as readonly string[]).includes(ty))
              ).length
              return (
                <Card
                  key={path.slug}
                  variant="light"
                  kicker={`0${i + 1}`}
                  title={item.title}
                  href={localeHref(locale, `/academy/${path.slug}`)}
                  className={`rv ${styles.pathCard}`}
                  style={{ '--rvd': `${i * 60}ms` } as CSSProperties}
                  meta={
                    <>
                      <span>
                        {count} {t.academy.pathsCourses}
                      </span>
                      <span className={styles.pathGo}>
                        {t.academy.pathsExplore}
                        <Arrow dir="e" size={12} />
                      </span>
                    </>
                  }
                >
                  {item.text}
                </Card>
              )
            })}
          </RevealGroup>
        </section>

        {/* ————— tutto intorno allo studio ————— */}
        <section className={`wrap ${styles.aroundSez}`}>
          <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
            {t.academy.aroundKicker}
          </Reveal>
          <RevealGroup className={styles.aroundList}>
            {AROUND.map((slug, i) => {
              const item = t.academy.aroundItems[i]
              return (
                <Link
                  key={slug}
                  href={localeHref(locale, `/academy/${slug}`)}
                  className={`rv ${styles.aroundRow}`}
                >
                  <span className={`mono ${styles.aroundIdx}`}>{`0${i + 1}`}</span>
                  <span className={styles.aroundBody}>
                    <span className={styles.aroundTitle}>{item.title}</span>
                    <span className={styles.aroundText}>{item.text}</span>
                  </span>
                  <span className={styles.aroundArrow} aria-hidden="true">
                    <Arrow dir="e" size={18} />
                  </span>
                </Link>
              )
            })}
          </RevealGroup>
        </section>

        <Rule left={t.academy.aroundKicker} right={t.common.courses} />

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

        <Rule left={t.common.courses} right={t.academy.storiaKicker} />

        {/* ————— dal 1999 ————— */}
        <section className={`wrap ${styles.storiaSez}`}>
          <SectionHeader kicker={t.academy.storiaKicker} title={t.academy.storiaTitle} />
          <RevealGroup className={styles.storiaGrid}>
            {t.academy.storiaItems.map((item, i) => (
              <div key={item.title} className={styles.storiaItem}>
                <span className={styles.storiaNum}>{`0${i + 1}`}</span>
                <h3 className={styles.storiaTitle}>{item.title}</h3>
                <p className={styles.storiaText}>{item.text}</p>
              </div>
            ))}
          </RevealGroup>
        </section>

        <Rule left={t.academy.storiaKicker} right={t.academy.teachersKicker} />

        {/* ————— docenti ————— */}
        <section className={`wrap ${styles.teachersSez}`}>
          <SectionHeader
            kicker={t.academy.teachersKicker}
            title={t.academy.teachersTitle}
          />
          <div className={styles.teachersIntro}>
            {t.academy.teachersIntro.map((p, i) => (
              <Reveal as="p" key={p} delay={i * 60} className={styles.teachersP}>
                {i === 1 ? withNames(p, t.academy.teachersNames) : p}
              </Reveal>
            ))}
          </div>
          <TeacherStrip
            teachers={teachers}
            locale={locale}
            join={{
              label: t.academy.joinUs,
              role: t.academy.joinUsRole,
              href: `mailto:${settings?.email ?? 'hello@bologna-creativehub.it'}?subject=${encodeURIComponent(t.academy.joinUs)}`,
            }}
            labels={{
              prev: t.academy.teachersPrev,
              next: t.academy.teachersNext,
              hint: t.academy.teachersHint,
            }}
          />
          <Reveal className={styles.inMemoria}>
            <h3 className={styles.inMemoriaTitle}>{t.academy.inMemoriaTitle}</h3>
            <p className={styles.inMemoriaText}>{t.academy.inMemoriaText}</p>
          </Reveal>
        </section>
      </main>
    </SiteChrome>
  )
}
