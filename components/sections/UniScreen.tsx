import {
  ArrowLink,
  Button,
  PartnerMark,
  Reveal,
  RevealGroup,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { PhotoFull } from '@/components/sections/Photo'
import { ParallaxMedia } from '@/components/sections/ParallaxMedia'
import finalImg from '@/public/img/sections/aula-corsi.jpg'
import { Thumb } from '@/components/sections/Thumb'
import { UniSubnav } from '@/components/sections/UniSubnav'
import { UniCourses, type UniCourseCard } from '@/components/sections/UniCourses'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAllCourses, getAllTeachers } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import styles from './UniScreen.module.css'

/* i dieci nomi scelti nel layout del cliente, nell'ordine del mock;
   le foto arrivano dai documenti teacher già in Sanity */
const TEACHER_IDS = [
  'teacher-angela-madonia',
  'teacher-stefania-martin',
  'teacher-cristiano-santini',
  'teacher-teo-ciavarella',
  'teacher-giampaolo-ascolese',
  'teacher-paolo-valli',
  'teacher-daniele-vinco',
  'teacher-antonello-giorgi',
  'teacher-andrea-marco-ricci',
  'teacher-giovanni-hoffer',
]

/* ruoli noti dal layout del cliente (in Sanity sono ancora vuoti) */
const TEACHER_ROLES: Record<string, { it: string; en: string }> = {
  'teacher-angela-madonia': { it: 'canto', en: 'voice' },
  'teacher-stefania-martin': { it: 'canto', en: 'voice' },
}

/**
 * Landing corsi universitari — la disposizione mandata dal cliente
 * (layout B, ott 2026) nella lingua del sito: testata di sezione,
 * indice sticky dalla scheda corso, card a foto piena, fasce su
 * hairline e chiusura in fascia nera.
 */
export async function UniScreen({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const u = t.uni

  const [courses, teachers] = await Promise.all([
    getAllCourses(),
    getAllTeachers(),
  ])

  /* le card nell'ordine del dizionario; foto e link dal corso Sanity
     con lo stesso slug — un corso senza scheda nel dizionario resta
     sulla griglia generica di /academy/corsi */
  const cards: UniCourseCard[] = Object.entries(u.cards).flatMap(
    ([slug, c]) => {
      const course = courses.find((x) => x.slug?.current === slug)
      if (!course) return []
      return [
        {
          slug,
          href: localeHref(locale, `/academy/${slug}`),
          title: l(course.title, locale) ?? slug,
          image: course.coverImage,
          ciclo: c.ciclo as 'primo' | 'master',
          area: c.area,
          areaLabel: c.areaLabel,
          tag: c.tag,
          desc: c.desc,
          instruments: 'instruments' in c ? c.instruments : undefined,
          meta: c.meta,
        },
      ]
    }
  )

  const faculty = TEACHER_IDS.flatMap((id) => {
    const tch = teachers.find((x) => x._id === id)
    return tch ? [tch] : []
  })

  const subnavItems = Object.entries(u.subnav).map(([id, label]) => ({
    id,
    label,
  }))

  const contactHref = localeHref(locale, '/chi-siamo#contatti')
  const openDayHref = localeHref(locale, '/academy/open-day')
  const year = u.kicker.split('·').pop()?.trim() ?? ''

  return (
    <SiteChrome locale={locale} path="/academy">
      <main className={styles.main}>
        {/* ————— testata ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal className={styles.back}>
            <ArrowLink href={localeHref(locale, '/academy')} reverse>
              {t.topics.backTo} {t.nav.academy.toLowerCase()}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
            {u.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={120}>
            {u.title}
          </Reveal>
          <div className={styles.headRow}>
            <Reveal as="p" className={styles.lede} delay={180}>
              {u.lede}
            </Reveal>
            <Reveal className={styles.ctaRow} delay={240}>
              <Button href={openDayHref}>{u.ctaOpenDay}</Button>
              <Button href={contactHref} variant="azzurro">
                {u.ctaInfo}
              </Button>
            </Reveal>
          </div>
        </header>

        {/* ————— indice sticky (UI della scheda corso) ————— */}
        <UniSubnav
          course={u.title}
          year={year}
          items={subnavItems}
          prevLabel={locale === 'it' ? 'sezione precedente' : 'previous section'}
          nextLabel={locale === 'it' ? 'sezione successiva' : 'next section'}
        />

        {/* ————— 01 i corsi ————— */}
        <section className={`wrap ${styles.sez}`} id="corsi">
          <UniCourses
            cards={cards}
            labels={{
              ...u.filters,
              cycles: u.cycles,
              goLabel: u.goCta,
            }}
          />
        </section>

        {/* ————— 02 in numeri ————— */}
        <section className={`wrap ${styles.sez}`} id="numeri">
          <SectionHeader kicker={u.numbers.n} title={u.numbers.title} />
          <RevealGroup className={styles.stats}>
            {u.numbers.stats.map((s, i) => (
              <Reveal key={s.n} className={styles.stat} delay={i * 60}>
                <div className={`display-thin ${styles.statN}`}>{s.n}</div>
                <div className={styles.statL}>{s.l}</div>
                {'src' in s && (
                  <span className={`mono ${styles.statSrc}`}>{s.src}</span>
                )}
              </Reveal>
            ))}
          </RevealGroup>
        </section>

        {/* ————— 03 il titolo ————— */}
        <section className={`wrap ${styles.sez}`} id="titolo">
          <SectionHeader
            kicker={u.degree.n}
            title={u.degree.title}
            lede={u.degree.lead}
          />
          <RevealGroup className={styles.cols3}>
            {u.degree.cols.map((col, i) => (
              <Reveal key={col.k} className={styles.col} delay={i * 60}>
                <span className="mono">{col.k}</span>
                <h3 className={styles.colTitle}>{col.title}</h3>
                <p className={styles.colText}>{col.text}</p>
              </Reveal>
            ))}
          </RevealGroup>
          <Reveal className={styles.partners} delay={120}>
            {u.degree.partners.map((name) => (
              <PartnerMark key={name} name={name} />
            ))}
          </Reveal>
        </section>

        {/* ————— 04 ammissioni e costi ————— */}
        <section className={`wrap ${styles.sez}`} id="ammissioni">
          <SectionHeader
            kicker={u.admissions.n}
            title={u.admissions.title}
            lede={u.admissions.lead}
          />
          <RevealGroup className={styles.steps4}>
            {u.admissions.steps.map((s, i) => (
              <Reveal key={s.title} className={styles.stepCell} delay={i * 60}>
                <span className={`mono ${styles.stepN}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepText}>{s.text}</p>
              </Reveal>
            ))}
          </RevealGroup>
          <RevealGroup className={styles.price}>
            {u.admissions.prices.map((p, i) => (
              <Reveal
                key={p.k}
                className={
                  'linkLabel' in p
                    ? `${styles.pcard} ${styles.pcardInvert}`
                    : styles.pcard
                }
                delay={i * 60}
              >
                <span className="mono">{p.k}</span>
                <div className={styles.pcardV}>{p.v}</div>
                <p className={styles.pcardText}>{p.text}</p>
                {'linkLabel' in p && (
                  <ArrowLink
                    href={localeHref(locale, '/academy/servizi-studenti')}
                    className={styles.pcardLink}
                  >
                    {p.linkLabel}
                  </ArrowLink>
                )}
              </Reveal>
            ))}
          </RevealGroup>
          <Reveal className={styles.admCta} delay={120}>
            <Button href={contactHref}>{u.admissions.ctaApply}</Button>
            <Button href={contactHref} variant="azzurro">
              {u.admissions.ctaCosts}
            </Button>
          </Reveal>
        </section>

        {/* ————— 05 docenti ————— */}
        <section className={`wrap ${styles.sez}`} id="docenti">
          <SectionHeader
            kicker={u.teachers.n}
            title={u.teachers.title}
            lede={u.teachers.lead}
          />
          <RevealGroup className={styles.docGrid}>
            {faculty.map((tch, i) => (
              <Reveal key={tch._id} className={styles.doc} delay={(i % 5) * 60}>
                <Thumb
                  image={tch.photo}
                  index={i}
                  ratio="4 / 5"
                  alt={tch.name ?? ''}
                />
                <span className={styles.docName}>{tch.name}</span>
                {(TEACHER_ROLES[tch._id]?.[locale] ??
                  l(tch.role, locale)) && (
                  <span className={`mono ${styles.docRole}`}>
                    {TEACHER_ROLES[tch._id]?.[locale] ?? l(tch.role, locale)}
                  </span>
                )}
              </Reveal>
            ))}
          </RevealGroup>
          <div className={styles.docFoot}>
            <ArrowLink href={localeHref(locale, '/academy')}>
              {u.teachers.allLink}
            </ArrowLink>
          </div>
        </section>

        {/* ————— 06 storie ————— */}
        <section className={`wrap ${styles.sez}`} id="storie">
          <SectionHeader
            kicker={u.stories.n}
            title={u.stories.title}
            lede={u.stories.lead}
          />
          <RevealGroup className={styles.testi}>
            {u.stories.items.map((s, i) => (
              <Reveal key={s.detail} className={styles.tcard} delay={i * 60}>
                <q className={styles.tquote}>{s.quote}</q>
                <div className={styles.twho}>
                  {s.who}
                  <span>{s.detail}</span>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </section>

        {/* ————— 07 domande ————— */}
        <section className={`wrap ${styles.sez}`} id="faq">
          <SectionHeader kicker={u.faq.n} title={u.faq.title} />
          <Reveal className={styles.faq}>
            {u.faq.items.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div className={styles.ans}>
                  <p>{f.a}</p>
                </div>
              </details>
            ))}
          </Reveal>
        </section>

        {/* ————— 08 vieni a trovarci: fascia nera ————— */}
        <section className={`scheme-dark ${styles.visit}`} id="orientamento">
          <div className="wrap">
            <Reveal as="span" className="mono">
              {u.visit.n}
            </Reveal>
            <Reveal as="h2" className={`display-thin ${styles.visitTitle}`} delay={60}>
              {u.visit.title}
            </Reveal>
            <Reveal as="p" className={styles.visitLede} delay={120}>
              {u.visit.lead}
            </Reveal>
            <RevealGroup className={styles.opts}>
              {u.visit.opts.map((o, i) => (
                <Reveal key={o.title} className={styles.opt} delay={i * 60}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className={styles.optTitle}>{o.title}</h3>
                  <p className={styles.optText}>{o.text}</p>
                  {i === 0 ? (
                    <Button href={openDayHref} className={styles.optBtn}>
                      {o.cta}
                    </Button>
                  ) : i === 1 ? (
                    <Button href={contactHref} className={styles.optBtn}>
                      {o.cta}
                    </Button>
                  ) : (
                    <Button
                      href="https://wa.me/390516313706"
                      external
                      className={styles.optBtn}
                    >
                      {o.cta}
                    </Button>
                  )}
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ————— foto finale a tutto schermo ————— */}
        <div className={styles.finalPhoto}>
          <PhotoFull src={finalImg} alt={u.final.alt} caption={u.final.caption} />
        </div>
        <ParallaxMedia />
      </main>
    </SiteChrome>
  )
}
