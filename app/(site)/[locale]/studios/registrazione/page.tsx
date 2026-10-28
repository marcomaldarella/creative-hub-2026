import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLink,
  Button,
  Card,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { BgVideo } from '@/components/sections/BgVideo'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getSiteSettings } from '@/lib/sanity/queries'
import regLiveRoomImg from '@/public/img/foto/reg-live-room.jpg'
import regVocalBoothImg from '@/public/img/foto/reg-vocal-booth.jpg'
import regControlRoomImg from '@/public/img/foto/reg-control-room.jpg'
import { ContactForm } from '@/components/sections/ContactForm'
import det from '@/components/sections/DetailPage.module.css'
import { StudioContacts } from '@/components/sections/StudioContacts'
import tp from '@/components/sections/TopicScreen.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* etichetta della Rule dal titolo di sezione: via il punto, tutto minuscolo
   (così resta giusta anche in inglese, senza chiavi dedicate) */
const kickerOf = (s: string) => s.replace(/\.+$/, '').toLowerCase()

/* le foto dei tre ambienti (27/10), nell'ordine di d.where:
   live room, vocal booth, control room */
const WHERE_PHOTOS = [
  { src: regLiveRoomImg, alt: 'La live room: batteria e backline pronti' },
  {
    src: regVocalBoothImg,
    alt: 'La cabina vocale: microfono a condensatore e pop filter',
  },
  { src: regControlRoomImg, alt: 'La regia dietro il vetro, verso la sala' },
]

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
      {/* revisione 27/10: TUTTA la pagina è nera, tranne FAQ e lo
          specchietto arrangiamento (arancio) */}
      <main className={`scheme-dark ${det.main}`}>
        {/* ————— testata: testo a sinistra, live room a destra — ARANCIO
            come le sorelle, anche se il resto della pagina è nero ————— */}
        <header className={`wrap ${det.head} ${det.headAccent}`}>
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
                <Button variant="ghost" className={det.btnInk} href={mailBook} external>
                  {d.book}
                </Button>
              </Reveal>
            </div>
            <Reveal className={det.headPh} delay={120}>
              {/* la regia SSL in movimento (clip 28/10): loop ping-pong
                  muto al posto della foto statica */}
              <BgVideo
                src="/video/regia-ssl-8s-1920x1080.mp4"
                poster="/img/sections/regia-ssl-poster.jpg"
                className={det.headVideo}
              />
            </Reveal>
          </div>
        </header>

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
              <Card
                key={m.title}
                className={`rv ${styles.modeCard} ${styles.cardDark}`}
                kicker={m.kicker}
                title={m.title}
              >
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
          <Reveal
            as="ul"
            className={`${det.check} ${styles.checkSteps}`}
            delay={80}
          >
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

        {/* ————— specchietto arrangiamento: fascia ARANCIO (una delle due
            sole pause di colore sulla pagina nera, revisione 27/10) ————— */}
        <div className={det.promoAccent}>
          <section className={`wrap ${det.sez}`}>
            <Reveal as="span" className={`mono ${det.kicker}`}>
              {d.arrKicker}
            </Reveal>
            <Reveal as="h2" className={`display-thin ${det.promoTitle}`} delay={60}>
              {d.arrTitle}
            </Reveal>
            <Reveal as="p" className={det.promoText} delay={120}>
              {d.arrText}
            </Reveal>
            <Reveal delay={180}>
              <Button
                variant="ghost"
                className={det.btnInk}
                href={mailArr}
                external
              >
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
            <Button
              variant="ghost"
              className={det.btnPill}
              href={localeHref(locale, '/studios')}
            >
              {d.whereCta}
            </Button>
          </Reveal>
          <RevealGroup className={det.grid3}>
            {d.where.map((w, i) => (
              <div key={w.title} className={`rv ${styles.whereCard}`}>
                <figure className={styles.wherePh}>
                  <Image
                    src={WHERE_PHOTOS[i % WHERE_PHOTOS.length].src}
                    alt={WHERE_PHOTOS[i % WHERE_PHOTOS.length].alt}
                    fill
                    sizes="(max-width: 860px) 100vw, 33vw"
                  />
                </figure>
                <div className={styles.whereBody}>
                  <span className={`mono ${styles.whereNum}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className={styles.whereTitle}>{w.title}</h3>
                  <p className={styles.whereText}>{w.text}</p>
                </div>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— prima di prenotare: FAQ in fascia arancio ————— */}
        <div className={det.faqBand}>
          <Rule left="05" right={kickerOf(d.faqTitle)} />
          <section className={`wrap ${det.sez} ${det.duo}`}>
            <Reveal as="h2" className={`display-thin ${det.h2}`}>
              {d.faqTitle}
            </Reveal>
            <PointsAccordion items={d.faq} plain />
          </section>
        </div>

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
