import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLink, Button, Reveal, RevealGroup } from '@/components/ui'
import { QuickBookForm } from '@/components/sections/QuickBookForm'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { BgVideo } from '@/components/sections/BgVideo'
import { PhotoDuo } from '@/components/sections/Photo'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { PhotoStrip } from '@/components/sections/PhotoStrip'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { MobileBookBar } from '@/components/sections/MobileBookBar'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getSiteSettings } from '@/lib/sanity/queries'
import {
  COWORKING_ROW_SLUGS,
  getBookableProducts,
} from '@/lib/woocommerce'
import corridoio1Img from '@/public/img/foto/corridoio-1.jpg'
import corridoio2Img from '@/public/img/foto/corridoio-2.jpg'
import corridoio3Img from '@/public/img/foto/corridoio-3.jpg'
import corridoio4Img from '@/public/img/foto/corridoio-4.jpg'
import corridoio5Img from '@/public/img/foto/corridoio-5.jpg'
import corridoio6Img from '@/public/img/foto/corridoio-6.jpg'
import corridoio7Img from '@/public/img/foto/corridoio-7.jpg'
import banano1Img from '@/public/img/foto/banano-1.jpg'
import banano2Img from '@/public/img/foto/banano-2.jpg'
import futureImg from '@/public/img/sections/future-together.jpg'
import sedeImg from '@/public/img/foto/sede.jpg'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: t.nav.coworking,
    description: t.coworking.lede,
    alternates: pageAlternates(locale, '/coworking'),
  }
}

/* iconcine dei fatti e della dotazione: segni a tratto, mai emoji */
const ICONS = [
  /* pin */ 'M12 21s6-6 6-10.5A6 6 0 0 0 6 10.5C6 15 12 21 12 21z M12 12.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z',
  /* onde wifi */ 'M3 10a13 13 0 0 1 18 0 M6 13.2a9 9 0 0 1 12 0 M9 16.3a5 5 0 0 1 6 0 M12 19.4h.01',
  /* persone */ 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3.5 19a5.5 5.5 0 0 1 11 0 M15.5 5.6a3 3 0 0 1 0 5.8 M17 13.6a5.5 5.5 0 0 1 3.5 5.4',
]

function Ic({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

/**
 * Coworking come pagina di prodotto (dal mockup v3, nella grammatica
 * del sito): mosaico media, titolo con i fatti, contenuto a sinistra
 * col riquadro di prenotazione fisso a destra, formule in tabella,
 * poi il palazzo per immagini a tutto campo.
 */
export default async function CoworkingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const [settings, products] = await Promise.all([
    getSiteSettings(),
    getBookableProducts(),
  ])
  /* ogni formula del riquadro apre direttamente la sua scheda prodotto
     (richiesta 28/10), nella stessa scheda: otto su otto. Sette stanno
     sullo shop WordPress; l'ufficio è il prodotto locale non
     acquistabile e apre la scheda interna /prenota/ufficio */
  const bySlug = new Map(products.map((p) => [p.slug, p.permalink]))
  const prenota = localeHref(locale, '/coworking/prenota')
  const sale = localeHref(locale, '/coworking/sale-eventi')
  /* prezzi pieni barrati, allineati alle righe della tabella: nel
     mockup solo il carnet da dieci ingressi ne ha uno */
  const tableWas = t.coworking.tableWas
  /* le foto del palazzo stanno qui e non inline nel JSX perché il tasto
     "vedi tutte le foto" del mosaico ne porta il CONTEGGIO (come nel
     mockup, "Vedi tutte le foto (10)"): il numero si legge dall'elenco
     vero, non si scrive a mano.
     ⚠️ i testi alternativi erano assegnati ai file sbagliati: qui sono
     rimessi sulla foto giusta, didascalie comprese */
  const corridoi = [
    { src: corridoio1Img, alt: 'Murale "future together" lungo il corridoio, con una pianta in primo piano', caption: t.coworking.corridoiCaptions[0] },
    { src: corridoio2Img, alt: 'Scala interna con il murale "small steps big change" su parete arancio', caption: t.coworking.corridoiCaptions[1] },
    { src: corridoio6Img, alt: 'Corridoio delle aule CW301 con segnaletica gialla a pavimento e pareti', caption: t.coworking.corridoiCaptions[2] },
    { src: corridoio7Img, alt: "Ingresso dell'area CW300: pareti bianche, segnaletica gialla e parquet", caption: t.coworking.corridoiCaptions[3] },
    { src: corridoio5Img, alt: 'Corridoio della library, con la scritta arancio sulla parete scura', caption: t.coworking.corridoiCaptions[4] },
    { src: corridoio3Img, alt: "Porta dell'ufficio segreteria vista dal corridoio", caption: t.coworking.corridoiCaptions[5] },
    { src: corridoio4Img, alt: 'Corridoio lungo verso gli uffici, con la targa della segreteria', caption: t.coworking.corridoiCaptions[6] },
  ]

  return (
    <SiteChrome locale={locale} path="/coworking">
      <main className={styles.main}>
        {/* ————— barra delle tre pagine della sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/coworking" current="/coworking" />

        {/* ————— mosaico media: video + due foto, come le piattaforme
            di prenotazione — "vedi tutte le foto" scende al palazzo ————— */}
        <section className={`wrap ${styles.mosaic}`}>
          <Reveal className={styles.mosaicMain}>
            <BgVideo
              src="/video/node-coworking.mp4"
              poster="/img/sections/coworking-lounge.jpg"
              className={styles.mosaicVideo}
            />
          </Reveal>
          <Reveal className={styles.mosaicSide} delay={80}>
            <Image src={banano1Img} alt="La banano room: tavolo rotondo, sedute in velluto e luci calde" className={styles.mosaicImg} />
          </Reveal>
          <Reveal className={styles.mosaicSide} delay={140}>
            <Image src={corridoio2Img} alt='Scala interna con il murale "small steps big change"' className={styles.mosaicImg} />
          </Reveal>
          {/* le altre due del mosaico del mockup: il corridoio "future
              together" e la banano room d'insieme */}
          <Reveal className={styles.mosaicSide} delay={200}>
            <Image src={futureImg} alt='Il corridoio con il murale "future together" e le sedute blu' className={styles.mosaicImg} />
          </Reveal>
          <Reveal className={styles.mosaicSide} delay={260}>
            <Image src={banano2Img} alt="La banano room: soffitto industriale e il grande banano al centro" className={styles.mosaicImg} />
          </Reveal>
          <a href="#palazzo" className={`mono ${styles.galleryCta}`}>
            {t.coworking.galleryCta} ({corridoi.length})
          </a>
        </section>

        {/* ————— titolo con i dati chiave ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal as="span" className={`mono ${styles.kicker}`}>
            {t.coworking.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
            {t.coworking.title.split('\n').map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </Reveal>
          <RevealGroup className={styles.facts}>
            {t.coworking.facts.map((f, i) => (
              <span key={f} className={`rv ${styles.fact}`}>
                <Ic d={ICONS[i % ICONS.length]} />
                {f}
              </span>
            ))}
          </RevealGroup>
        </header>

        {/* ————— due colonne: contenuto + riquadro prenota fisso —————
            da "Com'è lavorare qui" fino ai corridoi il fondo è chiaro
            (richiesta 28/10); il nero resta sulla card prenota e
            riparte dai corridoi in poi */}
        <div className={`wrap ${styles.lay}`}>
          <div className={styles.colL}>
            {/* com'è lavorare qui */}
            <section className={styles.block}>
              <h2 className={styles.h2}>{t.coworking.hereTitle}</h2>
              {t.coworking.hereText.map((p) => (
                <p key={p} className={styles.p}>
                  {p}
                </p>
              ))}
            </section>

            {/* cosa trovi */}
            <section className={styles.block}>
              <h2 className={styles.h2}>{t.coworking.amenitiesTitle}</h2>
              <ul className={styles.amenities2}>
                {t.coworking.amenities.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </section>

            {/* le formule, in tabella */}
            <section className={styles.block}>
              <h2 className={styles.h2}>{t.coworking.spacesTitle}</h2>
              <div className="scroller">
                <table className={`listino ${styles.cmp}`}>
                  <thead>
                    <tr>
                      {t.coworking.tableHead.map((h) => (
                        <th key={h} scope="col" className="mono">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.coworking.tableRows.map((row, i) => (
                      <tr key={row[0]}>
                        <th scope="row">{row[0]}</th>
                        {/* data-label: sul telefono la tabella diventa un
                            elenco e ogni valore si porta dietro il nome
                            della sua colonna */}
                        <td
                          className={styles.price}
                          data-label={t.coworking.tableHead[1]}
                        >
                          {row[1]}
                          {tableWas[i] && (
                            <s className={styles.was}>{tableWas[i]}</s>
                          )}
                        </td>
                        <td data-label={t.coworking.tableHead[2]}>{row[2]}</td>
                        <td data-label={t.coworking.tableHead[3]}>{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.salaCta}>
                <ArrowLink href={sale} dir="e">
                  {t.coworking.salaCta}
                </ArrowLink>
              </div>
            </section>

            {/* prima di prenotare */}
            <section className={styles.block}>
              <h2 className={styles.h2}>{t.coworking.faqTitle}</h2>
              <PointsAccordion items={t.coworking.faq} />
            </section>

            {/* dove siamo */}
            <section className={styles.block}>
              <h2 className={styles.h2}>{t.coworking.whereTitle}</h2>
              <ul className={styles.whereList}>
                {t.coworking.where.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              <Image
                src={sedeImg}
                alt="La sede di via del Tappezziere 4, Bologna"
                className={styles.whereImg}
              />
            </section>
          </div>

          {/* riquadro prenota: fisso accanto al contenuto */}
          <aside className={styles.book} aria-label={t.coworking.bookCta}>
            <div className={styles.bookHead}>
              <div className={styles.bookFrom}>
                {t.coworking.bookFrom}{' '}
                <b>{t.coworking.bookPrice}</b> {t.coworking.bookUnit}
              </div>
              <span className={styles.bookChoose}>{t.coworking.bookChoose}</span>
            </div>
            {/* legenda e sottodidascalie del mockup: ogni formula dice
                in una riga a cosa serve. ⚠️ l'unità di tempo di quick e
                full desk ("al mese?") nel mockup è tratteggiata, cioè da
                confermare: qui resta fuori */}
            {/* il mockup chiede qui la richiesta rapida, non un rimando:
                tre campi e via. Il percorso guidato resta in fondo */}
            <QuickBookForm
              labels={t.coworking.quickBook}
              subject={t.coworking.bookCta}
              moreHref={prenota}
              options={t.coworking.tableRows.map((row, i) => {
                const slug = COWORKING_ROW_SLUGS[i]
                return {
                  name: row[0],
                  hint: t.coworking.bookHints[i],
                  price: row[1],
                  /* senza permalink (ufficio) si apre la scheda interna */
                  href:
                    bySlug.get(slug) ||
                    localeHref(locale, `/prenota/${slug}`),
                }
              })}
            />
            {settings?.phone && (
              <ArrowLink href={`tel:${settings.phone.replace(/\s/g, '')}`} external>
                {settings.phone}
              </ArrowLink>
            )}
          </aside>
        </div>

        {/* ————— dai corridoi in poi la pagina torna nera, fino alla
            fascia azzurra del day pass ————— */}
        <div className={`scheme-dark ${styles.darkBand}`}>
        {/* ————— il palazzo, per immagini ————— */}
        <section className={styles.sez} id="palazzo">
          <PhotoStrip
            kicker={t.coworking.corridoiKicker}
            title={t.coworking.corridoiTitle}
            text={t.coworking.corridoiText}
            labels={{
              prev: t.coworking.corridoiPrev,
              next: t.coworking.corridoiNext,
              hint: t.coworking.corridoiHint,
            }}
            /* come nel mockup ogni foto porta il nome dello spazio */
            photos={corridoi}
          />
        </section>

        {/* ————— la banano room (senza occhiello: il titolo basta) ————— */}
        <section className={`${styles.sez} ${styles.banano}`}>
          <div className="wrap">
            <PhotoDuo
              title={t.coworking.bananoTitle}
              text={t.coworking.bananoText}
              photos={[
                {
                  src: banano1Img,
                  alt: 'La banano room del coworking: tavolo rotondo, sedute in velluto e luci calde',
                },
                {
                  src: banano2Img,
                  alt: "La banano room vista d'insieme: soffitto industriale, grande banano al centro e divani",
                },
              ]}
            />
          </div>
        </section>
        </div>

        {/* ————— cta day pass (azzurro) ————— */}
        <section className={`${styles.sez} ${styles.cta}`} id="prenota">
          <div className={`wrap ${styles.ctaIn}`}>
            <div>
              <span className={`mono ${styles.ctaKicker}`}>
                {t.coworking.ctaKicker}
              </span>
              <h2 className={`display-thin ${styles.ctaTitle}`}>
                {t.coworking.ctaTitle}
              </h2>
              <p className={styles.ctaText}>{t.coworking.ctaText}</p>
            </div>
            <Button href={localeHref(locale, '/prenota/day-pass')}>
              {t.coworking.ctaDayPass}
            </Button>
          </div>
        </section>

        {/* ————— barra prenota fissa in basso, solo su mobile: il
            riquadro a destra sparisce e resta il prezzo col tasto ————— */}
        <MobileBookBar
          from={t.coworking.bookFrom}
          price={t.coworking.bookPrice}
          unit={t.coworking.bookUnit}
          cta={t.coworking.mobileBarCta}
          href={prenota}
        />
      </main>
    </SiteChrome>
  )
}
