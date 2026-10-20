import type { Metadata } from 'next'
import Image, { type StaticImageData } from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLink, Button, Reveal, RevealGroup, Rule } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getPageById, getSiteSettings } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import banano1Img from '@/public/img/foto/banano-1.jpg'
import banano2Img from '@/public/img/foto/banano-2.jpg'
import corridoio1Img from '@/public/img/foto/corridoio-1.jpg'
import corridoio2Img from '@/public/img/foto/corridoio-2.jpg'
import sedeImg from '@/public/img/foto/sede.jpg'
import loungeImg from '@/public/img/sections/coworking-lounge.jpg'
import designingImg from '@/public/img/sections/designing-the.jpg'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* foto di sede abbinate alle sale, nell'ordine del documento Sanity:
   riunioni, didattica, area culture, aula magna, showroom, banano */
const ROOM_PHOTOS: { src: StaticImageData; alt: string }[] = [
  { src: corridoio2Img, alt: "Ingresso dell'area CW300: pareti bianche e parquet" },
  { src: corridoio1Img, alt: 'Corridoio delle aule CW301 con segnaletica gialla' },
  { src: loungeImg, alt: 'La lounge: sedute e grafiche geometriche alle pareti' },
  { src: sedeImg, alt: 'La sede di via del Tappezziere 4' },
  { src: designingImg, alt: 'La parete gialla "designing the future" lungo il corridoio' },
  { src: banano1Img, alt: 'La banano room: tavolo rotondo, sedute in velluto e luci calde' },
]

type Block = {
  style?: string
  listItem?: string
  children?: { text?: string; marks?: string[] }[]
}

const textOf = (b: Block) =>
  (b.children ?? []).map((c) => c.text ?? '').join('').trim()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: `${t.saleEventiPage.roomsTitle} — ${t.nav.coworking}`,
    description: t.topics.saleEventi.lede,
    alternates: pageAlternates(locale, '/coworking/sale-eventi'),
  }
}

export default async function SaleEventiPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const [page, settings] = await Promise.all([
    getPageById('sale-eventi'),
    getSiteSettings(),
  ])

  /* dal documento Sanity: sale (h3+testo), già successo (• etichetta),
     faq (domanda+risposta) — restano editabili dallo Studio */
  const sec = (idx: number) =>
    ((l(page?.sections?.[idx]?.body, locale) ?? []) as Block[])
  const rooms: { title: string; text: string }[] = []
  for (const b of sec(0)) {
    if (b.style === 'h3') rooms.push({ title: textOf(b), text: '' })
    else if (rooms.length) rooms[rooms.length - 1].text = textOf(b)
  }
  const past = sec(1)
    .filter((b) => b.listItem)
    .map((b) => {
      const spans = b.children ?? []
      const strong = spans.length > 1 && (spans[0].marks ?? []).includes('strong')
      return strong
        ? {
            title: (spans[0].text ?? '').trim(),
            text: spans.slice(1).map((c) => c.text ?? '').join('').replace(/^\s*—\s*/, '').trim(),
          }
        : { title: textOf(b), text: '' }
    })
  const faq: { title: string; text: string }[] = []
  for (const b of sec(2)) {
    if (b.style === 'h3' || b.style === 'h4') faq.push({ title: textOf(b), text: '' })
    else if (faq.length) faq[faq.length - 1].text = textOf(b)
  }

  const mailto = settings?.email
    ? `mailto:${settings.email}?subject=${encodeURIComponent(t.saleEventiPage.ctaTitle)}`
    : localeHref(locale, '/chi-siamo#contatti')

  return (
    <SiteChrome locale={locale} path="/coworking">
      <main className={styles.main}>
        {/* ————— testata ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal className={styles.back}>
            <ArrowLink href={localeHref(locale, '/coworking')} reverse>
              {t.saleEventiPage.back}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
            {t.saleEventiPage.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={120}>
            {t.topics.saleEventi.title}
          </Reveal>
          <RevealGroup className={styles.facts}>
            {t.saleEventiPage.facts.map((f) => (
              <span key={f} className={`rv ${styles.fact}`}>
                {f}
              </span>
            ))}
          </RevealGroup>
        </header>

        {/* ————— le sale: card con foto ————— */}
        <Rule left="01" right={t.saleEventiPage.roomsKicker} />
        <section className={`wrap ${styles.sez}`}>
          <Reveal as="h2" className={`display-thin ${styles.h2}`}>
            {t.saleEventiPage.roomsTitle}
          </Reveal>
          <RevealGroup className={styles.rooms}>
            {rooms.map((room, i) => (
              <div key={room.title} className={`rv ${styles.room}`}>
                <div className={styles.roomPh}>
                  {ROOM_PHOTOS[i] && (
                    <Image
                      src={ROOM_PHOTOS[i].src}
                      alt={ROOM_PHOTOS[i].alt}
                      className={styles.roomImg}
                    />
                  )}
                </div>
                <h3 className={styles.roomTitle}>{room.title}</h3>
                <p className={styles.roomText}>{room.text}</p>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— già successo qui ————— */}
        {past.length > 0 && (
          <>
            <Rule left="02" right={t.saleEventiPage.pastKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <Reveal as="h2" className={`display-thin ${styles.h2}`}>
                {t.saleEventiPage.pastTitle}
              </Reveal>
              <div className={styles.past}>
                <Reveal className={styles.pastPh}>
                  <Image
                    src={banano2Img}
                    alt="Networking nella banano room"
                    className={styles.roomImg}
                  />
                </Reveal>
                <div className={styles.pastList}>
                  {past.map((p) => (
                    <Reveal key={p.title} className={styles.pastItem}>
                      <h3 className={styles.roomTitle}>{p.title}</h3>
                      {p.text && <p className={styles.roomText}>{p.text}</p>}
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ————— prima di prenotare ————— */}
        {faq.length > 0 && (
          <>
            <Rule left="03" right={t.saleEventiPage.faqKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <Reveal as="h2" className={`display-thin ${styles.h2}`}>
                {t.saleEventiPage.faqTitle}
              </Reveal>
              <PointsAccordion items={faq} />
            </section>
          </>
        )}

        {/* ————— chiusura: chiedi una proposta ————— */}
        <div className={`scheme-dark ${styles.dark}`}>
          <section className={`wrap ${styles.sez}`}>
            <Reveal as="h2" className={`display-thin ${styles.ctaTitle}`}>
              {t.saleEventiPage.ctaTitle}
            </Reveal>
            <Reveal as="p" className={styles.ctaText} delay={80}>
              {t.saleEventiPage.ctaText}
            </Reveal>
            <Reveal className={styles.ctaRow} delay={160}>
              <Button variant="azzurro" href={mailto} external>
                {t.saleEventiPage.ctaBook}
              </Button>
              {settings?.phone && (
                <ArrowLink
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  external
                >
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
