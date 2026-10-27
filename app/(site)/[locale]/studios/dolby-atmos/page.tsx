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

/* i marchi della regia hanno il loro logo: file e altezza, perché le
   proporzioni degli SVG sono diverse fra loro */
const ROOM_LOGHI: Record<string, [string, number]> = {
  Genelec: ['genelec-bianco.svg', 30],
  'Avid MTRX': ['avid-bianco.svg', 74],
  Avid: ['avid-bianco.svg', 74],
  Dolby: ['dolby-bianco.svg', 80],
}

/* etichetta della Rule dal titolo di sezione: via il punto, tutto minuscolo
   (così resta giusta anche in inglese, senza chiavi dedicate) */
const kickerOf = (s: string) => s.replace(/\.+$/, '').toLowerCase()

/* foto delle quattro applicazioni, nell'ordine del dizionario:
   musica, cinema e serie, media e installazioni, gaming */
/* una foto per ogni uso: musica in regia, cinema sul set, media e
   installazioni, gaming, didattica */
const USE_PHOTOS = [
  { src: studioSslImg, alt: 'La console SSL durante una sessione di mix' },
  {
    src: sdCinemaImg,
    alt: 'Troupe sul set: operatore e microfonista durante una ripresa',
  },
  {
    src: sdInstallazioniImg,
    alt: 'Parete di diffusori acustici in uno spazio espositivo',
  },
  {
    src: sdVideogiochiImg,
    alt: 'Televisori a tubo catodico con videogiochi accesi',
  },
  {
    src: sdPubblicitaImg,
    alt: 'Timeline di montaggio con la forma d’onda dell’audio',
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
   che hanno DAVVERO una risposta — un accordion vuoto è rotto */
const pairsOf = (blocks: Block[]) => {
  const out: { title: string; text: string }[] = []
  for (const b of blocks) {
    if (b.style === 'h3' || b.style === 'h4') {
      out.push({ title: textOf(b), text: '' })
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
    title: t.studioSub.atmos.metaTitle,
    description: t.studioSub.atmos.metaDesc,
    alternates: pageAlternates(locale, '/studios/dolby-atmos'),
  }
}

export default async function DolbyAtmosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.studioSub.atmos
  const [page, settings] = await Promise.all([
    getPageById('dolby-atmos'),
    getSiteSettings(),
  ])

  /* dal documento Sanity (v2): per cosa si usa (lede), laboratorio,
     domande sull'Atmos — restano editabili dallo Studio */
  const sec = (idx: number) =>
    ((l(page?.sections?.[idx]?.body, locale) ?? []) as Block[])
  const usesLede = textOf(sec(0)[0] ?? {}) || d.usesLede
  const labText = textOf(sec(1)[0] ?? {}) || d.labText
  const faq = pairsOf(sec(2))

  const email = t.studioSub.email
  const mailBook = `mailto:${email}?subject=${encodeURIComponent(d.book)}`
  const mailRemix = `mailto:${email}?subject=${encodeURIComponent(d.remixTitle)}`

  return (
    <SiteChrome locale={locale} path="/studios/dolby-atmos">
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
                src={studioRegiaImg}
                alt="La regia dello studio"
                className={det.headImg}
                sizes="(max-width: 860px) 100vw, 50vw"
                priority
              />
            </Reveal>
          </div>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/studios" current="/studios/dolby-atmos" />

        {/* ————— manifesto bicolore: la seconda frase in tono abbassato ————— */}
        <Rule left="01" right={d.manifestoKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${styles.manifesto}`}>
            {d.manifestoA}{' '}
            <span className={styles.manifestoDim}>{d.manifestoB}</span>
          </Reveal>
        </section>

        {/* ————— la regia atmos: fascia nera con le quattro voci ————— */}
        <div className={`scheme-dark ${tp.band}`}>
          <div className="wrap">
            <Reveal as="span" className={`mono ${styles.bandKicker}`}>
              {d.roomKicker}
            </Reveal>
            <RevealGroup className={styles.specs}>
              {d.room.map((r) => {
                /* dove il nome è un marchio, si vede il logo vero */
                const logo = ROOM_LOGHI[r.t]
                return (
                  <span key={r.t} className="rv">
                    {logo ? (
                      <span
                        className={styles.specLogo}
                        role="img"
                        aria-label={r.t}
                        style={{
                          maskImage: `url(/img/partners-studio/${logo[0]})`,
                          WebkitMaskImage: `url(/img/partners-studio/${logo[0]})`,
                          height: `${logo[1]}px`,
                        }}
                      />
                    ) : (
                      <span className={`display-thin ${styles.specT}`}>{r.t}</span>
                    )}
                    <span className={styles.specS}>{r.s}</span>
                  </span>
                )
              })}
            </RevealGroup>
          </div>
        </div>

        {/* ————— per cosa si usa: quattro card a foto piena ————— */}
        <Rule left="02" right={kickerOf(d.usesTitle)} />
        <section className={`wrap ${det.sez}`}>
          <SectionHeader title={d.usesTitle} lede={usesLede} />
          <RevealGroup className={styles.apps}>
            {d.uses.map((u, i) => (
              <div key={u.title} className={`rv ${uni.card} ${styles.appCard}`}>
                <figure className={uni.ph}>
                  <Image
                    src={USE_PHOTOS[i % USE_PHOTOS.length].src}
                    alt={USE_PHOTOS[i % USE_PHOTOS.length].alt}
                    fill
                    sizes="(max-width: 560px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  />
                </figure>
                <h3 className={uni.cardTitle}>{u.title}</h3>
                <p className={styles.appText}>{u.text}</p>
                <div className={styles.appLink}>
                  <ArrowLink href={mailBook} external dir="e">
                    {d.talk}
                  </ArrowLink>
                </div>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— promo remix: fascia nera ————— */}
        <div className={`scheme-dark ${det.promo}`}>
          <section className={`wrap ${det.sez}`}>
            <Reveal as="span" className={`mono ${styles.bandKicker}`}>
              {d.remixKicker}
            </Reveal>
            <Reveal as="h2" className={`display-thin ${det.promoTitle}`} delay={60}>
              {d.remixTitle}
            </Reveal>
            <Reveal as="p" className={det.promoText} delay={120}>
              {d.remixText}
            </Reveal>
            <Reveal delay={180}>
              <Button variant="azzurro" href={mailRemix} external>
                {d.remixCta}
              </Button>
            </Reveal>
          </section>
        </div>

        {/* ————— laboratorio permanente: rimando a Innovazione ————— */}
        <Rule left="03" right={d.labKicker} />
        <section className={`wrap ${det.sez} ${det.duo}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.labTitle}
          </Reveal>
          <div>
            <Reveal as="p" className={tp.sezP}>
              {labText}
            </Reveal>
            <Reveal delay={80}>
              <ArrowLink href={localeHref(locale, '/innovazione')} dir="e">
                {d.labCta}
              </ArrowLink>
            </Reveal>
          </div>
        </section>

        {/* ————— domande sull'Atmos: solo le coppie con risposta in Sanity ————— */}
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
                defaultTopic={t.form.studioTopics[2]}
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
