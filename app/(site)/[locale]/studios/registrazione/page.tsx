import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLink,
  Button,
  Card,
  Marquee,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getSiteSettings } from '@/lib/sanity/queries'
import liveBandImg from '@/public/img/foto/live-band.jpg'
import { ContactForm } from '@/components/sections/ContactForm'
import det from '@/components/sections/DetailPage.module.css'
import { StudioContacts } from '@/components/sections/StudioContacts'
import tp from '@/components/sections/TopicScreen.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* etichetta della Rule dal titolo di sezione: via il punto, tutto minuscolo
   (così resta giusta anche in inglese, senza chiavi dedicate) */
const kickerOf = (s: string) => s.replace(/\.+$/, '').toLowerCase()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: t.studioSub.registrazione.metaTitle,
    description: t.studioSub.registrazione.metaDesc,
    alternates: pageAlternates(locale, '/studios/registrazione'),
  }
}

export default async function RegistrazionePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.studioSub.registrazione
  const settings = await getSiteSettings()

  const email = t.studioSub.email
  const mailBook = `mailto:${email}?subject=${encodeURIComponent(d.book)}`
  const mailArr = `mailto:${email}?subject=${encodeURIComponent(d.arrTitle)}`

  return (
    <SiteChrome locale={locale} path="/studios/registrazione">
      <main className={det.main}>
        {/* ————— testata: testo a sinistra, live room a destra ————— */}
        <header className={`wrap ${det.head}`}>
          <div className={det.headGrid}>
            <div>
              <Reveal className={det.back}>
                <ArrowLink href={localeHref(locale, '/studios')} reverse>
                  {t.studioSub.back}
                </ArrowLink>
              </Reveal>
              <Reveal as="span" className={`mono ${det.kicker}`} delay={60}>
                {d.kicker}
              </Reveal>
              <Reveal as="h1" className={`display-thin ${det.title}`} delay={120}>
                {d.title}
              </Reveal>
              <Reveal as="p" className={det.lede} delay={180}>
                {d.lede}
              </Reveal>
              <RevealGroup className={det.facts}>
                {d.facts.map((f) => (
                  <span key={f.t} className={`rv ${det.fact}`}>
                    <span className={det.factT}>{f.t}</span>
                    <span className={det.factS}>{f.s}</span>
                  </span>
                ))}
              </RevealGroup>
              <Reveal className={det.heroRow} delay={120}>
                <Button variant="azzurro" href={mailBook} external>
                  {d.book}
                </Button>
              </Reveal>
            </div>
            <Reveal className={det.headPh} delay={120}>
              <Image
                src={liveBandImg}
                alt="Band in presa diretta nella live room"
                className={det.headImg}
                sizes="(max-width: 860px) 100vw, 50vw"
                priority
              />
            </Reveal>
          </div>
        </header>

        {/* ————— fascia marquee: la frase del mockup, nel nostro stile ————— */}
        <div className={`scheme-dark ${styles.mq}`}>
          <Marquee
            dark
            speed={30}
            items={[
              <span key="t" className={styles.mqText}>
                {d.marquee}
              </span>,
              <Button
                key="b"
                variant="azzurro"
                className={styles.mqBtn}
                href={mailBook}
                external
              >
                {d.book}
              </Button>,
            ]}
          />
        </div>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/studios" current="/studios/registrazione" />

        {/* ————— tre modi di registrare ————— */}
        <Rule left="01" right={d.modesKicker} />
        <section className={`wrap ${det.sez}`}>
          <SectionHeader
            kicker={d.modesKicker}
            title={d.modesTitle}
            lede={d.modesLede}
          />
          <RevealGroup className={det.grid3}>
            {d.modes.map((m) => (
              <Card key={m.title} className="rv" kicker={m.kicker} title={m.title}>
                {m.text}
              </Card>
            ))}
          </RevealGroup>
        </section>

        {/* ————— la presa diretta: fascia nera ————— */}
        <div className={`scheme-dark ${tp.band}`}>
          <div className={`wrap ${det.duo}`}>
            <div>
              <Reveal as="span" className={`mono ${styles.bandKicker}`}>
                {d.liveKicker}
              </Reveal>
              <Reveal as="h2" className={`display-thin ${det.h2}`} delay={60}>
                {d.liveTitle}
              </Reveal>
            </div>
            <div>
              <Reveal as="p" className={tp.sezP}>
                {d.liveText}
              </Reveal>
              <Reveal
                as="ul"
                className={`${det.check} ${styles.checkOne}`}
                delay={80}
              >
                {d.livePoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </Reveal>
            </div>
          </div>
        </div>

        {/* ————— cosa registriamo ————— */}
        <Rule left="02" right={kickerOf(d.whatTitle)} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.whatTitle}
          </Reveal>
          <Reveal as="ul" className={det.check} delay={80}>
            {d.what.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </Reveal>
        </section>

        {/* ————— remote recording in quattro passi ————— */}
        <Rule left="03" right="remote recording" />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.remoteTitle}
          </Reveal>
          <RevealGroup className={tp.steps}>
            {d.remoteSteps.map((s, i) => (
              <div key={s.title} className={`rv ${tp.step}`}>
                <span className={`mono ${tp.stepNum}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={tp.stepTitle}>{s.title}</h3>
                <p className={tp.stepText}>{s.text}</p>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— promo arrangiamento: fascia nera ————— */}
        <div className={`scheme-dark ${det.promo}`}>
          <section className={`wrap ${det.sez}`}>
            <Reveal as="span" className={`mono ${styles.bandKicker}`}>
              {d.arrKicker}
            </Reveal>
            <Reveal as="h2" className={`display-thin ${det.promoTitle}`} delay={60}>
              {d.arrTitle}
            </Reveal>
            <Reveal as="p" className={det.promoText} delay={120}>
              {d.arrText}
            </Reveal>
            <Reveal delay={180}>
              <Button variant="azzurro" href={mailArr} external>
                {d.arrCta}
              </Button>
            </Reveal>
          </section>
        </div>

        {/* ————— dove registri ————— */}
        <Rule left="04" right={d.whereKicker} />
        <section className={`wrap ${det.sez}`}>
          <SectionHeader
            kicker={d.whereKicker}
            title={d.whereTitle}
            lede={d.whereLede}
          />
          {/* il rimando del mockup accanto al lede: dalla sala alla
              pagina di tutto lo studio */}
          <Reveal className={styles.whereCta} delay={60}>
            <ArrowLink href={localeHref(locale, '/studios')} dir="e">
              {d.whereCta}
            </ArrowLink>
          </Reveal>
          <RevealGroup className={det.grid3}>
            {d.where.map((w, i) => (
              <Card
                key={w.title}
                className="rv"
                kicker={String(i + 1).padStart(2, '0')}
                title={w.title}
              >
                {w.text}
              </Card>
            ))}
          </RevealGroup>
        </section>

        {/* ————— prima di prenotare: le domande dei mockup ————— */}
        <Rule left="05" right={kickerOf(d.faqTitle)} />
        <section className={`wrap ${det.sez} ${det.duo}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.faqTitle}
          </Reveal>
          <PointsAccordion items={d.faq} plain />
        </section>

        {/* ————— chiusura: raccontaci il progetto ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <section className={`wrap ${det.sez} ${det.duo}`}>
            <div>
              <Reveal as="h2" className={`display-thin ${det.ctaTitle}`}>
                {d.ctaTitle}
              </Reveal>
              <Reveal as="p" className={det.ctaText} delay={80}>
                {d.ctaText}
              </Reveal>
              <StudioContacts
                email={email}
                phone={settings?.phone}
                notes={t.studioSub.notes}
              />
            </div>
            {/* il form del mockup: mailto composto, servizio preselezionato */}
            <Reveal delay={140}>
              <ContactForm
                to={email}
                subject={d.ctaTitle}
                topics={t.form.studioTopics}
                defaultTopic={t.form.studioTopics[0]}
                labels={{
                  ...t.form,
                  topic: t.form.topicNeed,
                  messagePlaceholder: t.form.messagePlaceholderStudio,
                }}
                privacyHref={localeHref(locale, '/privacy')}
                sendLabel={t.form.sendRequest}
                company={false}
              />
            </Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
