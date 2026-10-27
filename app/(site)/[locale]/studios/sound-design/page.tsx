import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLink,
  Button,
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
import { getPageById, getSiteSettings } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import studioRegiaImg from '@/public/img/sections/studio-regia.jpg'
import studioRegiaBImg from '@/public/img/sections/studio-regia-b.jpg'
import studioDeskImg from '@/public/img/sections/studio-desk.jpg'
import studioSslImg from '@/public/img/foto/studio-ssl.jpg'
import sdCinemaImg from '@/public/img/foto/sd-cinema.jpg'
import sdPubblicitaImg from '@/public/img/foto/sd-pubblicita.jpg'
import sdVideogiochiImg from '@/public/img/foto/sd-videogiochi.jpg'
import sdInstallazioniImg from '@/public/img/foto/sd-installazioni.jpg'
/* le card a foto piena dei corsi (layout B): modulo condiviso */
import uni from '@/components/sections/UniScreen.module.css'
import { ContactForm } from '@/components/sections/ContactForm'
import det from '@/components/sections/DetailPage.module.css'
import { StudioContacts } from '@/components/sections/StudioContacts'
import tp from '@/components/sections/TopicScreen.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* etichetta della Rule dal titolo di sezione: via il punto, tutto minuscolo
   (così resta giusta anche in inglese, senza chiavi dedicate) */
const kickerOf = (s: string) => s.replace(/\.+$/, '').toLowerCase()

/* foto dei quattro committenti, nell'ordine del dizionario:
   cinema e serie, pubblicità e video, videogiochi, installazioni */
/* una foto per ogni mondo a cui lavoriamo, nell'ordine delle voci:
   cinema e serie, pubblicità e video, videogiochi, installazioni */
const CLIENT_PHOTOS = [
  {
    src: sdCinemaImg,
    alt: 'Troupe sul set: operatore alla macchina e microfonista con l’asta durante una ripresa in esterni',
  },
  {
    src: sdPubblicitaImg,
    alt: 'Timeline di montaggio video su monitor, con la forma d’onda dell’audio in alto',
  },
  {
    src: sdVideogiochiImg,
    alt: 'Parete di televisori a tubo catodico con videogiochi accesi e un’insegna al neon',
  },
  {
    src: sdInstallazioniImg,
    alt: 'Parete di diffusori acustici di epoche diverse in uno spazio espositivo',
  },
]

type Block = {
  style?: string
  listItem?: string
  children?: { text?: string }[]
}

const textOf = (b: Block) =>
  (b.children ?? []).map((c) => c.text ?? '').join('').trim()

/* coppie titolo+testo (h3 seguito dal paragrafo): tengono solo le voci
   che hanno DAVVERO un testo — un accordion vuoto è rotto. L'eventuale
   numero davanti al titolo ("1. Spotting") cade: il numero lo mette la UI */
const pairsOf = (blocks: Block[]) => {
  const out: { title: string; text: string }[] = []
  for (const b of blocks) {
    if (b.style === 'h3' || b.style === 'h4') {
      out.push({ title: textOf(b).replace(/^\d+\.\s*/, ''), text: '' })
    } else if (out.length && !out[out.length - 1].text) {
      out[out.length - 1].text = textOf(b)
    }
  }
  return out.filter((p) => p.title && p.text)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: t.studioSub.soundDesign.metaTitle,
    description: t.studioSub.soundDesign.metaDesc,
    alternates: pageAlternates(locale, '/studios/sound-design'),
  }
}

export default async function SoundDesignPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.studioSub.soundDesign
  const [page, settings] = await Promise.all([
    getPageById('sound-design'),
    getSiteSettings(),
  ])

  /* dal documento Sanity (v2): per chi lavoriamo (lede), cosa facciamo,
     i cinque passi, le domande frequenti, il rimando al Master — restano
     editabili dallo Studio, il dizionario fa da rete */
  const sec = (idx: number) =>
    ((l(page?.sections?.[idx]?.body, locale) ?? []) as Block[])
  const forLede = textOf(sec(0)[0] ?? {}) || d.forLede
  const whatSan = sec(1).filter((b) => b.listItem).map(textOf).filter(Boolean)
  const what = whatSan.length ? whatSan : d.what
  const stepsSan = pairsOf(sec(2))
  const steps = stepsSan.length ? stepsSan : d.steps
  const faq = pairsOf(sec(3))
  const masterText = textOf(sec(4)[0] ?? {}) || d.masterText

  const email = t.studioSub.email
  const mailBook = `mailto:${email}?subject=${encodeURIComponent(d.book)}`

  return (
    <SiteChrome locale={locale} path="/studios/sound-design">
      <main className={det.main}>
        {/* ————— testata: testo a sinistra, regia a destra ————— */}
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
              <Reveal
                as="h1"
                className={`display-thin ${det.title}`}
                style={{ whiteSpace: 'pre-line' }}
                delay={120}
              >
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
                src={studioDeskImg}
                alt="La postazione di lavoro in regia"
                className={det.headImg}
                sizes="(max-width: 860px) 100vw, 50vw"
                priority
              />
            </Reveal>
          </div>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/studios" current="/studios/sound-design" />

        {/* ————— per chi lavoriamo: quattro card a foto piena ————— */}
        <Rule left="01" right={kickerOf(d.forTitle)} />
        <section className={`wrap ${det.sez}`}>
          <SectionHeader title={d.forTitle} lede={forLede} />
          <RevealGroup className={styles.apps}>
            {d.clients.map((c, i) => (
              <div key={c.title} className={`rv ${uni.card} ${styles.appCard}`}>
                <figure className={uni.ph}>
                  <Image
                    src={CLIENT_PHOTOS[i % CLIENT_PHOTOS.length].src}
                    alt={CLIENT_PHOTOS[i % CLIENT_PHOTOS.length].alt}
                    fill
                    sizes="(max-width: 560px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  />
                </figure>
                <h3 className={uni.cardTitle}>{c.title}</h3>
                <p className={styles.appText}>{c.text}</p>
                <div className={styles.appLink}>
                  <ArrowLink href={mailBook} external dir="e">
                    {d.talk}
                  </ArrowLink>
                </div>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— cosa facciamo: la checklist dei servizi ————— */}
        <Rule left="02" right={kickerOf(d.whatTitle)} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.whatTitle}
          </Reveal>
          <Reveal as="ul" className={det.check} delay={80}>
            {what.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </Reveal>
        </section>

        {/* ————— dal montaggio al master: i cinque passi ————— */}
        <Rule left="03" right={kickerOf(d.stepsTitle)} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.stepsTitle}
          </Reveal>
          <RevealGroup className={tp.steps}>
            {steps.map((s, i) => (
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

        {/* ————— promo colonne sonore: fascia nera, rimando interno ————— */}
        <div className={`scheme-dark ${det.promo}`}>
          <section className={`wrap ${det.sez}`}>
            <Reveal as="span" className={`mono ${styles.bandKicker}`}>
              {d.scoreKicker}
            </Reveal>
            <Reveal as="h2" className={`display-thin ${det.promoTitle}`} delay={60}>
              {d.scoreTitle}
            </Reveal>
            <Reveal as="p" className={det.promoText} delay={120}>
              {d.scoreText}
            </Reveal>
            <Reveal delay={180}>
              <Button
                variant="azzurro"
                href={localeHref(locale, '/studios/registrazione')}
              >
                {d.scoreCta}
              </Button>
            </Reveal>
          </section>
        </div>

        {/* ————— domande frequenti: solo le coppie con risposta in Sanity ————— */}
        {faq.length > 0 && (
          <>
            <Rule left="04" right={kickerOf(d.faqTitle)} />
            <div className={det.faqBand}>
              <section className={`wrap ${det.sez} ${det.duo}`}>
                <Reveal as="h2" className={`display-thin ${det.h2}`}>
                  {d.faqTitle}
                </Reveal>
                <PointsAccordion items={faq} plain />
              </section>
            </div>
          </>
        )}

        {/* ————— vuoi impararlo? rimando al Master dell'Academy ————— */}
        <Rule left="05" right={d.masterKicker} />
        <section className={`wrap ${det.sez} ${det.duo}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.masterTitle}
          </Reveal>
          <div>
            <Reveal as="p" className={tp.sezP}>
              {masterText}
            </Reveal>
            <Reveal delay={80}>
              <ArrowLink href={localeHref(locale, '/academy/corsi')} dir="e">
                {d.masterCta}
              </ArrowLink>
            </Reveal>
          </div>
        </section>

        {/* ————— chiusura: parlaci del tuo video ————— */}
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
                defaultTopic={t.form.studioTopics[3]}
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
