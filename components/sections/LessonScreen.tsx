import Link from 'next/link'
import {
  ArrowLink,
  Button,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { Thumb } from '@/components/sections/Thumb'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { urlFor } from '@/lib/sanity/image'
import { l } from '@/lib/sanity/l'
import type { Course, SiteSettings } from '@/lib/sanity/types'
import styles from './LessonScreen.module.css'

/* dal PortableText del body ai paragrafi piani */
function paragraphs(blocks?: unknown[] | null): string[] {
  if (!blocks) return []
  return (blocks as { _type?: string; children?: { text?: string }[] }[])
    .filter((b) => b._type === 'block')
    .map((b) => (b.children ?? []).map((c) => c.text ?? '').join('').trim())
    .filter(Boolean)
}

/**
 * Landing delle lezioni su misura (dai mockup v2, nella grammatica del
 * sito): hero con badge e cover, metodo, insegnanti veri, cosa impari,
 * tre modi di studiare, come funziona, FAQ, altre lezioni e chiusura.
 * Tutto dai dati Sanity del corso: le sezioni vuote non compaiono.
 */
export function LessonScreen({
  course,
  siblings,
  settings,
  locale,
}: {
  course: Course
  /** gli altri corsi custom, per il nastro "altre lezioni" */
  siblings: Course[]
  settings: SiteSettings | null
  locale: Locale
}) {
  const t = getDictionary(locale)
  const title = l(course.title, locale) ?? ''
  const lede = l(course.summary, locale)
  const metodo = paragraphs(l(course.body, locale))
  const teachers = (course.teachers ?? []).filter((tc) => tc?.name)
  const skills = (course.skills ?? [])
    .map((s) => ({ title: l(s.title, locale), text: l(s.text, locale) }))
    .filter((s) => s.title)
  const modi = (course.structure ?? [])
    .map((s) => ({ title: l(s.title, locale), text: l(s.text, locale) }))
    .filter((s) => s.title)
  const come = (course.admissions ?? [])
    .map((s) => ({ title: l(s.title, locale), text: l(s.text, locale) }))
    .filter((s) => s.title && s.text)
  const faq = (course.faq ?? [])
    .map((s) => ({ title: l(s.title, locale) ?? '', text: l(s.text, locale) ?? '' }))
    .filter((s) => s.title && s.text)
  const badges = (course.admissionsKeys ?? [])
    .map((k) => l(k, locale))
    .filter(Boolean) as string[]
  const modiIntro = l(course.structureIntro, locale)
  const academyPath = localeHref(locale, '/academy')
  const book = course.shopUrl ?? shopHref(settings)
  const kick = (n: number, label: string) => `0${n} — ${label}`
  let n = 0

  return (
    <SiteChrome locale={locale} path={`/academy/${course.slug?.current ?? ''}`}>
      <main className={styles.main}>
        {/* ————— hero: testata azzurra con badge e cover ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal className={styles.back}>
            <ArrowLink href={academyPath} reverse>
              {t.lesson.back}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
            {t.lesson.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={120}>
            {`${t.lesson.titlePrefix} ${title.toLowerCase()} ${t.lesson.titleSuffix}`}
          </Reveal>
          {lede && (
            <Reveal as="p" className={styles.lede} delay={180}>
              {lede}
            </Reveal>
          )}
          {badges.length > 0 && (
            <RevealGroup className={styles.badges}>
              {badges.map((b) => (
                <span key={b} className={`rv ${styles.badge}`}>
                  {b}
                </span>
              ))}
            </RevealGroup>
          )}
          <Reveal className={styles.heroCta} delay={240}>
            <Button variant="azzurro" href={book} external>
              {t.lesson.ctaBook}
            </Button>
            {settings?.email && (
              <ArrowLink href={`mailto:${settings.email}`} external>
                {t.lesson.ctaInfo}
              </ArrowLink>
            )}
          </Reveal>
        </header>

        {/* cover a tutto campo */}
        <Reveal className={styles.cover}>
          <Thumb image={course.coverImage} index={0} fill alt={title} />
        </Reveal>

        {/* ————— il metodo ————— */}
        {metodo.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.metodoKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.metodoKicker)}
                title={t.lesson.metodoTitle}
              />
              <div>
                {metodo.map((p, i) => (
                  <Reveal as="p" key={p} delay={i * 60} className={styles.metodoP}>
                    {p}
                  </Reveal>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ————— gli insegnanti (solo se collegati) ————— */}
        {teachers.length > 0 && (
          <div className={`scheme-dark ${styles.dark}`}>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.teachersKicker} />
            <section className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.teachersKicker)}
                title={t.lesson.teachersTitle}
              />
              <RevealGroup className={styles.teacherGrid}>
                {teachers.map((tc) => (
                  <div key={tc._id} className={`rv ${styles.teacher}`}>
                    <div className={styles.teacherPh}>
                      {tc.photo && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={urlFor(tc.photo)
                            .width(400)
                            .height(500)
                            .fit('crop')
                            .auto('format')
                            .url()}
                          alt={tc.name ?? ''}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <span className={styles.teacherName}>{tc.name}</span>
                    {l(tc.role, locale) && (
                      <span className={styles.teacherRole}>
                        {l(tc.role, locale)}
                      </span>
                    )}
                    {l(tc.bio, locale) && (
                      <span className={styles.teacherCred}>
                        {l(tc.bio, locale)}
                      </span>
                    )}
                  </div>
                ))}
              </RevealGroup>
            </section>
          </div>
        )}

        {/* ————— cosa impari ————— */}
        {skills.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.skillsKicker} />
            <section className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.skillsKicker)}
                title={l(course.skillsLede, locale) ?? ''}
              />
              <RevealGroup className={styles.cells}>
                {skills.map((s, i) => (
                  <div key={s.title} className={`rv ${styles.cell}`}>
                    <span className={`mono ${styles.cellNum}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={styles.cellTitle}>{s.title}</h3>
                    {s.text && <p className={styles.cellText}>{s.text}</p>}
                  </div>
                ))}
              </RevealGroup>
            </section>
          </>
        )}

        {/* ————— tre modi di studiare ————— */}
        {modi.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.modiKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.modiKicker)}
                title={t.lesson.modiTitle}
                lede={modiIntro ?? undefined}
              />
              <div className={styles.modi}>
                {modi.map((m) => (
                  <Reveal key={m.title} className={styles.modo}>
                    <h3 className={styles.cellTitle}>{m.title}</h3>
                    <p className={styles.cellText}>{m.text}</p>
                  </Reveal>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ————— come funziona: passi numerati ————— */}
        {come.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.comeKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.comeKicker)}
                title={t.lesson.comeTitle}
              />
              <div className={styles.steps}>
                {come.map((s, i) => (
                  <div key={s.title} className={styles.step}>
                    <span className={`mono ${styles.cellNum}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.cellText}>{s.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ————— faq ————— */}
        {faq.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.faqKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.faqKicker)}
                title={t.lesson.faqTitle}
              />
              <PointsAccordion items={faq} />
            </section>
          </>
        )}

        {/* ————— altre lezioni su misura ————— */}
        {siblings.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.othersKicker} />
            <section className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.othersKicker)}
                title={t.lesson.othersTitle}
              />
              <RevealGroup className={styles.others}>
                {siblings.map((c) => (
                  <Link
                    key={c._id}
                    href={`${academyPath}/${c.slug?.current ?? ''}`}
                    className={`rv ${styles.other}`}
                  >
                    {l(c.title, locale)}
                  </Link>
                ))}
              </RevealGroup>
            </section>
          </>
        )}

        {/* ————— chiusura: fascia nera col CTA ————— */}
        <div className={`scheme-dark ${styles.dark}`}>
          <section className={`wrap ${styles.sez} ${styles.ctaSez}`}>
            <Reveal as="h2" className={`display-thin ${styles.ctaTitle}`}>
              {t.lesson.ctaTitle}
            </Reveal>
            <Reveal as="p" className={styles.ctaText} delay={80}>
              {t.lesson.ctaText}
            </Reveal>
            <Reveal className={styles.heroCta} delay={160}>
              <Button variant="azzurro" href={book} external>
                {t.lesson.ctaBook}
              </Button>
              {settings?.phone && (
                <ArrowLink href={`tel:${settings.phone.replace(/\s/g, '')}`} external>
                  {settings.phone}
                </ArrowLink>
              )}
            </Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
