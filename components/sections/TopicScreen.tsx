import { Fragment } from 'react'
import Link from 'next/link'
import {
  ArrowLink,
  Button,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { PortableBlocks } from '@/components/sections/PortableBlocks'
import { Thumb } from '@/components/sections/Thumb'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAllCourses, getPageById, getSiteSettings } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import type { Topic } from '@/lib/topics'
import type { PageId } from '@/lib/sanity/types'
import styles from './TopicScreen.module.css'

/** etichetta di sezione mostrata come kicker e nel "torna a" */
const SECTION_KEY = {
  '/academy': 'academy',
  '/studios': 'studio',
  '/coworking': 'coworking',
  '/innovazione': 'innovation',
  '/chi-siamo': 'about',
} as const

/**
 * La pagina di una voce di menu. Mostra il titolo del documento testi, i
 * punti elenco, e — se la voce è una tipologia di corso — la griglia dei
 * corsi corrispondenti.
 *
 * Il corpo lungo è opzionale e arriva da Sanity: basta creare un documento
 * `page` con pageId uguale allo slug della voce e le sezioni compaiono qui
 * sotto, senza toccare il codice.
 */
export async function TopicScreen({
  locale,
  topic,
}: {
  locale: Locale
  topic: Topic
}) {
  const t = getDictionary(locale)
  const copy = t.topics[topic.key as keyof typeof t.topics] as {
    title: string
    lede: string
    points: string[]
  }

  const [courses, page, settings] = await Promise.all([
    topic.courseTypes ? getAllCourses() : Promise.resolve([]),
    getPageById(topic.slug as PageId),
    getSiteSettings(),
  ])

  const elenco = topic.courseTypes
    ? courses.filter((c) => c.types?.some((x) => topic.courseTypes!.includes(x)))
    : []

  const sezione = t.nav[SECTION_KEY[topic.base]]
  const sections = page?.sections ?? []

  return (
    <SiteChrome locale={locale} path={topic.base}>
      <main className={styles.main}>
        <header className={`wrap ${styles.head}`}>
          <Reveal className={styles.back}>
            <ArrowLink href={localeHref(locale, topic.base)} reverse>
              {t.topics.backTo} {sezione.toLowerCase()}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
            {sezione.toLowerCase()}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={120}>
            {copy.title}
          </Reveal>
          {copy.lede && (
            <Reveal as="p" className={styles.lede} delay={180}>
              {copy.lede}
            </Reveal>
          )}
        </header>

        {copy.points.length > 0 && (
          <section className={`wrap ${styles.points}`}>
            <RevealGroup className={styles.pointsList}>
              {copy.points.map((p, i) => (
                <Reveal as="p" key={p} delay={i * 60} className={styles.point}>
                  {p}
                </Reveal>
              ))}
            </RevealGroup>
          </section>
        )}

        {/* ————— corsi della tipologia ————— */}
        {topic.courseTypes && (
          <>
            <Rule left={sezione.toLowerCase()} right={t.common.courses} />
            <section className={styles.sez}>
              <div className="wrap">
                {elenco.length === 0 ? (
                  <p className={styles.empty}>{t.academy.empty}</p>
                ) : (
                  <RevealGroup className={styles.grid}>
                    {elenco.map((course, i) => {
                      const meta = [
                        l(course.duration, locale),
                        l(course.startDate, locale),
                        l(course.mode, locale),
                      ]
                        .filter(Boolean)
                        .map((s) => s?.toLowerCase())
                        .join(' · ')
                      return (
                        <Reveal key={course._id} delay={(i % 4) * 60}>
                          <Link
                            href={localeHref(
                              locale,
                              `/academy/${course.slug?.current ?? ''}`
                            )}
                            className={styles.course}
                          >
                            <Thumb
                              image={course.coverImage}
                              index={i}
                              ratio="3 / 4"
                              alt={l(course.title, locale) ?? ''}
                            />
                            <div className={styles.courseBody}>
                              <span className={`mono ${styles.courseKicker}`}>
                                {l(course.category?.title, locale)?.toLowerCase()}
                              </span>
                              <h2 className={styles.courseTitle}>
                                {l(course.title, locale)}
                              </h2>
                              <p className={styles.courseSummary}>
                                {l(course.summary, locale)}
                              </p>
                              {meta && (
                                <span className={`mono ${styles.courseMeta}`}>
                                  {meta}
                                </span>
                              )}
                            </div>
                          </Link>
                        </Reveal>
                      )
                    })}
                  </RevealGroup>
                )}
              </div>
            </section>
          </>
        )}

        {/* ————— corpo lungo, se il cliente lo scrive in Sanity ————— */}
        {sections.map((section, i) => (
          <Fragment key={section._key}>
            <Rule
              left={String(i + 1).padStart(2, '0')}
              right={l(section.kicker, locale)?.toLowerCase()}
            />
            <section className={styles.sez}>
              <div className={`wrap ${styles.editorial}`}>
                <SectionHeader
                  kicker={l(section.kicker, locale)?.toLowerCase()}
                  title={l(section.title, locale)}
                />
                <PortableBlocks value={l(section.body, locale)} />
              </div>
            </section>
          </Fragment>
        ))}

        {/* ————— cta ————— */}
        <section className={`wrap ${styles.cta}`}>
          <Reveal>
            <Button href={shopHref(settings)} external variant="azzurro">
              {t.nav.book}
            </Button>
          </Reveal>
          <Reveal delay={80}>
            <ArrowLink href={localeHref(locale, topic.base)}>
              {t.nav.explore}
            </ArrowLink>
          </Reveal>
        </section>
      </main>
    </SiteChrome>
  )
}
