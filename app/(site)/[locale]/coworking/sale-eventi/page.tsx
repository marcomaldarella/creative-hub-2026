import type { Metadata } from 'next'
import Image, { type StaticImageData } from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLink, Reveal, RevealGroup, Rule } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { MobileBookBar } from '@/components/sections/MobileBookBar'
import { EventBuilder } from '@/components/sections/EventBuilder'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getPageById, getSiteSettings } from '@/lib/sanity/queries'
import { getBookableProducts } from '@/lib/woocommerce'
import { l } from '@/lib/sanity/l'
import banano1Img from '@/public/img/foto/banano-1.jpg'
import banano2Img from '@/public/img/foto/banano-2.jpg'
import corridoio1Img from '@/public/img/foto/corridoio-1.jpg'
import corridoio2Img from '@/public/img/foto/corridoio-2.jpg'
import sedeImg from '@/public/img/foto/sede.jpg'
import loungeImg from '@/public/img/sections/coworking-lounge.jpg'
import designingImg from '@/public/img/sections/designing-the.jpg'
/* le card a foto piena dei corsi (layout B): modulo condiviso */
import uni from '@/components/sections/UniScreen.module.css'
import styles from './page.module.css'

/* foto degli eventi passati, nell'ordine del documento Sanity */
const PAST_PHOTOS = [
  { src: banano2Img, alt: 'Networking nella banano room: grande banano al centro e divani' },
  { src: loungeImg, alt: 'La lounge del coworking durante un talk' },
]

export const dynamic = 'force-dynamic'

/* la sala proposta dal configuratore → slug del prodotto sullo shop */
const ROOM_SHOP_SLUGS: Record<string, string> = {
  riunione: 'sala-riunioni',
  corso: 'sala-didattica',
  grande: 'area-culture',
}

/* foto di sede abbinate alle sale, nell'ordine del documento Sanity:
   riunioni, didattica, area culture, aula magna, showroom, banano */
const ROOM_PHOTOS: { src: StaticImageData; alt: string }[] = [
  /* i testi alternativi seguono la foto vera, non il nome del file */
  { src: corridoio2Img, alt: 'Scala interna con il murale "small steps big change"' },
  { src: corridoio1Img, alt: 'Murale "future together" lungo il corridoio' },
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

  /* tipo di evento → scheda prodotto della sala sullo shop: la
     prenotazione si chiude lì, il configuratore resta per la richiesta
     su misura (le sale senza prodotto non mostrano il rimando) */
  const products = await getBookableProducts()
  const bySlug = new Map(products.map((p) => [p.slug, p.permalink]))
  const roomShopLinks = Object.fromEntries(
    Object.entries(ROOM_SHOP_SLUGS).flatMap(([id, slug]) => {
      const url = bySlug.get(slug)
      return url ? [[id, url] as const] : []
    })
  )

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
        {/* ————— barra delle tre pagine della sezione (mockup) ————— */}
        <SectionPagesNav
          locale={locale}
          base="/coworking"
          current="/coworking/sale-eventi"
        />

        {/* ————— apertura a foto: una grande e due impilate, come nel
            mockup (le sale non sono ancora fotografate: qui gli spazi
            comuni dove gli eventi si fanno davvero) ————— */}
        <Reveal className={`wrap ${styles.venue}`}>
          <Image
            src={banano2Img}
            alt="La banano room: soffitto industriale e grande banano al centro"
            className={styles.venueImg}
          />
          <div className={styles.venueStack}>
            <Image
              src={banano1Img}
              alt="La banano room: tavolo rotondo, sedute in velluto e luci calde"
              className={styles.venueImg}
            />
            <Image
              src={loungeImg}
              alt="La lounge del coworking: sedute e grafiche geometriche alle pareti"
              className={styles.venueImg}
            />
          </div>
        </Reveal>

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
                {/* codice, capienza e prezzo come nel mockup: le celle
                    capienza lasciate in giallo dal cliente non si stampano */}
                <div className={styles.roomTop}>
                  <span className={`mono ${styles.roomNum}`}>
                    {t.saleEventiPage.roomMeta[i]?.n}
                  </span>
                  {t.saleEventiPage.roomMeta[i]?.cap && (
                    <span className={styles.roomCap}>
                      {t.saleEventiPage.roomMeta[i].cap}
                    </span>
                  )}
                </div>
                <h3 className={styles.roomTitle}>{room.title}</h3>
                <p className={styles.roomText}>{room.text}</p>
                {t.saleEventiPage.roomMeta[i]?.price && (
                  <p className={styles.roomPrice}>
                    {t.saleEventiPage.roomMeta[i].price}
                  </p>
                )}
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— componi il tuo evento: quattro domande e il riepilogo
            che propone la sala, come nel mockup ————— */}
        <Rule left="02" right={t.saleEventiPage.builderKicker} />
        <section className={`wrap ${styles.sez}`} id="componi">
          <Reveal as="h2" className={`display-thin ${styles.h2}`}>
            {t.saleEventiPage.builderTitle}
          </Reveal>
          <EventBuilder
            locale={locale}
            labels={t.saleEventiPage.builder}
            lede={t.saleEventiPage.builderLede}
            privacyHref={localeHref(locale, '/privacy')}
            shopLinks={roomShopLinks}
          />
        </section>

        {/* ————— già successo qui ————— */}
        {past.length > 0 && (
          <>
            <Rule left="03" right={t.saleEventiPage.pastKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <Reveal as="h2" className={`display-thin ${styles.h2}`}>
                {t.saleEventiPage.pastTitle}
              </Reveal>
              {/* stesse card a foto piena dei corsi: il modulo si
                  condivide, la UI resta UNA */}
              <RevealGroup className={styles.pastGrid}>
                {past.map((p, i) => (
                  <div key={p.title} className={`rv ${uni.card}`}>
                    <figure className={uni.ph}>
                      <Image
                        src={PAST_PHOTOS[i % PAST_PHOTOS.length].src}
                        alt={PAST_PHOTOS[i % PAST_PHOTOS.length].alt}
                        fill
                        sizes="(max-width: 700px) 100vw, 50vw"
                      />
                    </figure>
                    <h3 className={uni.cardTitle}>{p.title}</h3>
                    {p.text && <p className={uni.cardDesc}>{p.text}</p>}
                  </div>
                ))}
              </RevealGroup>
            </section>
          </>
        )}

        {/* ————— prima di prenotare ————— */}
        {faq.length > 0 && (
          <>
            <Rule left="04" right={t.saleEventiPage.faqKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <Reveal as="h2" className={`display-thin ${styles.h2}`}>
                {t.saleEventiPage.faqTitle}
              </Reveal>
              <PointsAccordion items={faq} />
            </section>
          </>
        )}

        {/* ————— chiusura: dove siamo, come nel mockup — la richiesta
            passa dal configuratore qui sopra, non da un'altra CTA ————— */}
        <div className={`scheme-dark ${styles.dark}`}>
          <section className={`wrap ${styles.sez} ${styles.duo}`}>
            <Reveal as="h2" className={`display-thin ${styles.h2}`}>
              {t.coworking.whereTitle}
            </Reveal>
            <div>
              <Reveal>
                <ul className={styles.whereList}>
                  {t.coworking.where.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </Reveal>
              {/* recapiti, non una seconda CTA: la richiesta la fa il
                  configuratore qui sopra */}
              <Reveal className={styles.whereRow} delay={80}>
                {settings?.phone && (
                  <ArrowLink
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    external
                  >
                    {settings.phone}
                  </ArrowLink>
                )}
                <ArrowLink href={mailto} external>
                  {settings?.email ?? t.saleEventiPage.ctaBook}
                </ArrowLink>
              </Reveal>
              <Reveal delay={140}>
                <Image
                  src={sedeImg}
                  alt="La sede di via del Tappezziere 4, Bologna"
                  className={styles.whereImg}
                />
              </Reveal>
            </div>
          </section>
        </div>

        {/* ————— barra prenota fissa in basso, solo su mobile ————— */}
        <MobileBookBar
          from={t.coworking.bookFrom}
          price={t.saleEventiPage.roomMeta[0].price}
          cta={t.coworking.mobileBarCta}
          href="#componi"
        />
      </main>
    </SiteChrome>
  )
}
