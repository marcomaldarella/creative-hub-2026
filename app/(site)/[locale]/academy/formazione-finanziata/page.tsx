import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import finanziataImg from '@/public/img/sections/academy-finanziata.jpg'
import { Arrow, ArrowLink, Button, Reveal, RevealGroup, Rule } from '@/components/ui'
import { AvvisamiForm } from '@/components/sections/AvvisamiForm'
import { FundingBand } from '@/components/sections/FundingBand'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { hasScheda } from '@/lib/courses'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { l } from '@/lib/sanity/l'
import { getAllCourses } from '@/lib/sanity/queries'
/* grammatica condivisa delle pagine di dettaglio: testata, fatti,
   fascia di stato, pillole filtro, chiusura scura */
import det from '@/components/sections/DetailPage.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* questa route statica vince sulla [slug] di academy: la voce resta in
   lib/topics.ts perché serve ancora a menu e sitemap, ma il ramo
   findTopic('/academy', 'formazione-finanziata') non viene più raggiunto */
const PATH = '/academy/formazione-finanziata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: t.finanziata.seo.title,
    description: t.finanziata.seo.description,
    alternates: pageAlternates(locale, PATH),
  }
}

export default async function FormazioneFinanziataPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string }>
}) {
  const [{ locale }, { cat }] = await Promise.all([params, searchParams])
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.finanziata
  const topic = t.topics.formazioneFinanziata

  const base = localeHref(locale, PATH)
  /* categoria sconosciuta in query = come 'tutti' */
  const active = cat && d.filters.some((f) => f.key === cat) ? cat : 'tutti'

  const all = await getAllCourses()
  const corsi = all
    .filter((c) => c.types?.includes('finanziato'))
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  const elenco =
    active === 'tutti'
      ? corsi
      : corsi.filter((c) => c.category?.slug?.current === active)

  /* i punti della testata arrivano dal dizionario come "Titolo: dettaglio" */
  const facts = topic.points.map((p) => {
    const i = p.indexOf(':')
    return i === -1
      ? { title: p, sub: '' }
      : { title: p.slice(0, i), sub: p.slice(i + 1).trim() }
  })

  /* nella fascia scura l'accento torna al colore di sezione, come in
     TopicScreen: su nero l'inchiostro academy sarebbe invisibile */
  const bandVars = { '--accent-ink': 'var(--accent)' } as CSSProperties

  return (
    <SiteChrome locale={locale} path={PATH}>
      <main className={det.main}>
        {/* ————— testata: testo a sinistra, immagine a filo a destra ————— */}
        <header className={`wrap ${det.head}`}>
          <div className={det.headGrid}>
            <div>
              <Reveal className={det.back}>
                <ArrowLink href={localeHref(locale, '/academy')} reverse>
                  {`${t.topics.backTo} academy`}
                </ArrowLink>
              </Reveal>
              <Reveal as="span" className={`mono ${det.kicker}`} delay={60}>
                {`${t.nav.academy} · ${topic.eyebrow}`}
              </Reveal>
              <Reveal as="h1" className={`display-thin ${det.title}`} delay={120}>
                {d.title}
              </Reveal>
              <Reveal as="p" className={det.lede} delay={180}>
                {d.lede}
              </Reveal>
              <Reveal className={`${det.facts} ${styles.factsFull}`} delay={240}>
                {facts.map((f) => (
                  <div key={f.title} className={det.fact}>
                    <span className={det.factT}>{f.title}</span>
                    {f.sub && <span className={det.factS}>{f.sub}</span>}
                  </div>
                ))}
              </Reveal>
              <Reveal delay={300}>
                <Button href="#avvisami">{d.heroCta}</Button>
              </Reveal>
            </div>
            {/* la foto della testata: è la stessa che apre la card
                "formazione finanziata" nell'indice academy — prima qui
                c'era solo il placeholder nero, cioè un buco in pagina */}
            <Reveal className={det.headPh} delay={120}>
              <Image
                src={finanziataImg}
                alt="Uno studente al banco di regia, davanti allo schermo touch della DAW e al rack di effetti"
                priority
                sizes="(max-width: 860px) 100vw, 50vw"
                className={det.headImg}
              />
            </Reveal>
          </div>
        </header>

        {/* ————— fascia nera: da qui in giù la pagina vive su nero —————
            l'hero resta nell'azzurro del flood; tutto il resto sta nella
            stessa fascia scheme-dark (come la darkBand dell'indice
            academy): i token invertiti portano da soli testi e fili a
            chiaro, gli aggiusti puntuali stanno nel modulo locale */}
        <div className={`scheme-dark ${styles.darkBand}`}>
        {/* ————— avviso: oggi non ci sono iscrizioni aperte ————— */}
        <section className={styles.bandRow}>
          <div className={`wrap ${det.status}`}>
            <Reveal as="p" className={det.statusText}>
              {d.band.text}
            </Reveal>
            <Reveal delay={60}>
              <Button href="#avvisami" variant="ghost">
                {d.band.cta}
              </Button>
            </Reveal>
          </div>
        </section>

        {/* ————— come funzionano: le quattro colonne del mockup ————— */}
        <Rule left="01" right={d.howTitle.toLowerCase().replace(/\.$/, '')} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.howTitle}
          </Reveal>
          <Reveal as="p" className={det.sezLede} delay={60}>
            {d.howLede}
          </Reveal>
          <RevealGroup className={styles.how}>
            {d.howItems.map((item) => (
              <div key={item.title} className={`rv ${styles.howCell}`}>
                <h3 className={styles.howTitle}>{item.title}</h3>
                <p className={styles.howText}>{item.text}</p>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— i corsi: pillole filtro server-side (?cat=) + griglia ————— */}
        <Rule left="02" right={d.coursesTitle.toLowerCase().replace(/\.$/, '')} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.coursesTitle}
          </Reveal>
          <Reveal className={det.filters} delay={60}>
            {d.filters.map((f) => {
              const on = f.key === active
              return (
                <Link
                  key={f.key}
                  href={f.key === 'tutti' ? base : `${base}?cat=${f.key}`}
                  scroll={false}
                  className={
                    on ? `${det.filter} ${det.filterOn}` : `${det.filter} ${styles.pill}`
                  }
                  aria-current={on ? 'true' : undefined}
                >
                  {f.label}
                </Link>
              )
            })}
          </Reveal>

          {elenco.length === 0 ? (
            <p className="mono">{d.empty}</p>
          ) : (
            <RevealGroup className={styles.cards}>
              {elenco.map((course, i) => {
                const slug = course.slug?.current
                const title = l(course.title, locale) ?? ''
                const stato = course.editionStatus
                const inCorso = stato === 'in-corso' || stato === 'iscrizioni-aperte'
                const catLabel = l(course.category?.title, locale)
                const meta = [
                  l(course.durationShort, locale) ?? l(course.duration, locale),
                  d.city,
                  d.free,
                ].filter(Boolean)
                /* il corso in svolgimento è la card nera in evidenza */
                const cls = `rv ${styles.card}${
                  inCorso ? ` scheme-dark ${styles.cardHot}` : ''
                }`
                const style = { '--rvd': `${(i % 3) * 60}ms` } as CSSProperties
                const linked = slug ? hasScheda(course, locale) : false

                const inner = (
                  <>
                    {stato && (
                      <span
                        className={`${det.bandoStatus}${
                          stato === 'iscrizioni-aperte'
                            ? ` ${det.bandoAperto}`
                            : inCorso
                              ? ` ${det.bandoOpen}`
                              : ''
                        }`}
                      >
                        {d.status[stato]}
                      </span>
                    )}
                    {catLabel && (
                      <span className={styles.cardCat}>{catLabel.toLowerCase()}</span>
                    )}
                    <h3 className={styles.cardTitle}>{title}</h3>
                    {l(course.summary, locale) && (
                      <p className={styles.cardText}>{l(course.summary, locale)}</p>
                    )}
                    <div className={styles.cardFoot}>
                      <span className={styles.cardMeta}>{meta.join(' · ')}</span>
                      {/* la riga "scopri il corso" compare solo dove c'è
                          davvero una scheda da aprire */}
                      {linked && (
                        <span className={styles.cardCta}>
                          {d.cardCta}
                          <Arrow dir="e" size={14} />
                        </span>
                      )}
                    </div>
                  </>
                )

                return linked ? (
                  <Link
                    key={course._id}
                    href={`${base}/${slug}`}
                    className={cls}
                    style={style}
                  >
                    {inner}
                  </Link>
                ) : (
                  <article key={course._id} className={cls} style={style}>
                    {inner}
                  </article>
                )
              })}
            </RevealGroup>
          )}
        </section>

        {/* ————— rimando ai corsi universitari ————— */}
        <Rule left="03" right={d.uniCta.toLowerCase()} />
        <section className={`wrap ${det.sez}`}>
          <div className={styles.uni}>
            <div>
              <Reveal as="h2" className={`display-thin ${det.h2}`}>
                {d.uniTitle}
              </Reveal>
              <Reveal as="p" className={det.sezLede} delay={60}>
                {d.uniLede}
              </Reveal>
              <Reveal delay={120}>
                {/* sul nero il tasto pieno è bianco, non petrolio (che
                    sparirebbe): è l'override scheme-dark del variant */}
                <Button
                  variant="azzurro"
                  href={localeHref(locale, '/academy/corsi-universitari')}
                >
                  {d.uniCta}
                </Button>
              </Reveal>
            </div>
            <Reveal className={styles.uniPh} delay={80} aria-hidden="true" />
          </div>
        </section>

        {/* ————— domande frequenti ————— */}
        <Rule left="04" right={d.faqTitle.toLowerCase().replace(/\.$/, '')} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.faqTitle}
          </Reveal>
          <PointsAccordion items={d.faq} plain />
        </section>

        {/* ————— loghi e dicitura FSE+: obbligo normativo ————— */}
        <FundingBand logos={topic.funding.logos} text={topic.funding.text} />

        {/* ————— chiusura scura: avvisami al prossimo bando ————— */}
        <section
          id="avvisami"
          className={`scheme-dark ${styles.avvisami}`}
          style={bandVars}
        >
          <div className="wrap">
            <AvvisamiForm
              labels={t.avvisami}
              privacyHref={localeHref(locale, '/privacy')}
            />
          </div>
        </section>
        </div>
      </main>
    </SiteChrome>
  )
}
