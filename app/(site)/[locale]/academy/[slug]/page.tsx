import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLink, Button, Marquee, Reveal, Rule } from '@/components/ui'
import { PortableBlocks } from '@/components/sections/PortableBlocks'
import { Thumb } from '@/components/sections/Thumb'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { TeacherStrip } from '@/components/sections/TeacherStrip'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getCourseBySlug, getSiteSettings } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import { findTopic } from '@/lib/topics'
import { TopicScreen } from '@/components/sections/TopicScreen'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  /* le voci di menu vivono nello stesso spazio degli slug dei corsi */
  const topic = findTopic('/academy', slug)
  if (topic) {
    const t = getDictionary(locale)
    const copy = t.topics[topic.key as keyof typeof t.topics] as {
      title: string
      lede: string
    }
    return { title: copy.title, description: copy.lede }
  }
  const course = await getCourseBySlug(slug)
  const title = l(course?.title, locale)
  const description = l(course?.summary, locale)
  return title ? { title, description } : {}
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  /* /academy/corsi-universitari e simili non sono corsi: sono le pagine
     delle voci di menu, hanno la precedenza sullo slug del corso */
  const topic = findTopic('/academy', slug)
  if (topic) return <TopicScreen locale={locale} topic={topic} />

  const t = getDictionary(locale)

  const [course, settings] = await Promise.all([
    getCourseBySlug(slug),
    getSiteSettings(),
  ])
  if (!course) notFound()

  const bookHref = course.shopUrl ?? shopHref(settings)
  const teachers = course.teachers ?? []

  const facts = [
    { label: t.common.duration, value: l(course.duration, locale) },
    { label: t.common.start, value: l(course.startDate, locale) },
    { label: t.common.level, value: l(course.level, locale) },
    { label: t.common.language, value: l(course.language, locale) },
    { label: t.common.mode, value: l(course.mode, locale) },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value))

  return (
    <SiteChrome locale={locale} path={`/academy/${slug}`}>
      <main className={styles.main}>
        {/* ————— hero alla Catalyst: testi e dati chiave a sinistra,
            cover viva a filo a destra ————— */}
        <header className={styles.head}>
          <div className={styles.headText}>
            <Reveal className={styles.back}>
              <ArrowLink href={localeHref(locale, '/academy/corsi')} reverse>
                {t.academy.backToCourses}
              </ArrowLink>
            </Reveal>
            <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
              {l(course.category?.title, locale)?.toLowerCase() ?? t.academy.kicker}
            </Reveal>
            <Reveal as="h1" className={`display-thin ${styles.title}`} delay={120}>
              {l(course.title, locale)}
            </Reveal>
            {l(course.summary, locale) && (
              <Reveal as="p" className={styles.lede} delay={180}>
                {l(course.summary, locale)}
              </Reveal>
            )}

            {/* summary delle feature: i dati chiave del corso */}
            {facts.length > 0 && (
              <Reveal delay={220}>
                <dl className={styles.heroFacts}>
                  {facts.map((fact) => (
                    <div key={fact.label} className={styles.heroFact}>
                      <dt className="mono">{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}

            <Reveal delay={260}>
              <Button variant="azzurro" href={bookHref} external>
                {t.common.bookOn}
              </Button>
            </Reveal>
          </div>

          <Reveal className={styles.headMedia} delay={120}>
            <Thumb
              image={course.coverImage}
              ratio="4 / 3"
              width={1600}
              index={0}
              alt={l(course.title, locale) ?? ''}
            />
          </Reveal>
        </header>

        {/* ————— fascia nera: marquee continuo delle iscrizioni ————— */}
        <section className={`scheme-dark ${styles.enrollBand}`}>
          <Marquee
            speed={26}
            className={styles.enrollMarquee}
            items={[
              <span className={styles.enrollText} key="txt">
                {t.nav.topbar.middle}
              </span>,
              <Link
                className={styles.enrollPill}
                href={localeHref(locale, '/academy/open-day')}
                key="cta"
              >
                {t.nav.topbar.cta}
              </Link>,
            ]}
          />
        </section>

        <Rule left={t.nav.academy} right={t.academy.courseInfo} />

        {/* ————— corpo + sidebar sticky ————— */}
        <section className={`wrap ${styles.layout}`}>
          <div className={styles.body}>
            <Reveal>
              <PortableBlocks value={l(course.body, locale)} />
            </Reveal>

            {(course.gallery?.length ?? 0) > 0 && (
              <div className={styles.gallery}>
                <Reveal as="span" className={`mono ${styles.teachersKicker}`}>
                  {t.academy.courseGallery}
                </Reveal>
                <div className={styles.galleryGrid}>
                  {course.gallery!.map((shot, i) => (
                    <Reveal key={shot.asset?._ref ?? i} delay={(i % 3) * 60}>
                      <Thumb
                        image={shot}
                        index={i}
                        ratio="4 / 3"
                        width={900}
                        alt={l(course.title, locale) ?? ''}
                      />
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {teachers.length > 0 && (
              <div className={styles.teachers}>
                <Reveal as="span" className={`mono ${styles.teachersKicker}`}>
                  {t.academy.courseTeachers}
                </Reveal>
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
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}
