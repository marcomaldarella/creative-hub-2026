import type { Metadata } from 'next'
import { Suspense } from 'react'
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
import { BrandRow } from '@/components/sections/BrandMark'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { StudioBookingFlow } from '@/components/sections/StudioBookingFlow'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getSectionImages, getSpacesByKind } from '@/lib/sanity/queries'
import { getBookableProducts } from '@/lib/woocommerce'
import { l } from '@/lib/sanity/l'
import { urlFor } from '@/lib/sanity/image'
import det from '@/components/sections/DetailPage.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* la formula del flusso → slug del prodotto sullo shop WooCommerce:
   produzione si prenota come studio di registrazione, prove come
   sala prove; l'allestimento tour resta su preventivo */
const FORMULA_SHOP_SLUGS: Record<string, string> = {
  produzione: 'studio-di-registrazione',
  prove: 'sala-prove-con-batteria',
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
    title: t.studioSub.affitto.metaTitle,
    description: t.studioSub.affitto.metaDesc,
    alternates: pageAlternates(locale, '/studios/affitto-studio'),
  }
}

export default async function AffittoStudioPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.studioSub.affitto
  const [spaces, media] = await Promise.all([
    getSpacesByKind('studio'),
    getSectionImages('studios/affitto-studio'),
  ])
  /* foto sostituibili dal CMS (Media del sito → Pagina Affitto studio);
     senza slot compilato resta la foto di repo */
  const foto = (slot: string, fallback: string, w: number, h: number) =>
    media[slot]
      ? urlFor(media[slot]).width(w).height(h).fit('crop').auto('format').url()
      : fallback

  const email = t.studioSub.email
  const base = localeHref(locale, '/studios/affitto-studio')

  /* formula → prodotto WooCommerce: la prenotazione si chiude sulla
     scheda dello spazio sullo shop (lo shop resta su WP, vincolo di
     progetto). Senza catalogo raggiungibile il flusso torna da solo
     alla richiesta via form. */
  const products = await getBookableProducts()
  const bySlug = new Map(products.map((p) => [p.slug, p.permalink] as const))
  const shopLinks: Partial<Record<string, string>> = Object.fromEntries(
    Object.entries(FORMULA_SHOP_SLUGS).flatMap(([id, slug]) => {
      const url = bySlug.get(slug)
      return url ? [[id, url] as const] : []
    })
  )

  /* la dotazione: gli spazi studio veri da Sanity, più le voci che non
     sono stanze (software e strumenti del mockup, dal dizionario) —
     senza documenti la sezione non compare */
  const dotazione = [
    ...spaces.map((s) => ({
      title: l(s.title, locale) ?? '',
      text: l(s.summary, locale) ?? '',
    })),
    ...d.findExtra.map((e) => ({ title: e.title, text: e.text })),
  ].filter((i) => i.title && i.text)

  return (
    <SiteChrome locale={locale} path="/studios/affitto-studio">
      <main className={`${det.main} ${det.mainNeutral}`}>
        {/* ————— testata: testo a sinistra, regia a destra ————— */}
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
                {/* la CTA apre il flusso di prenotazione in fondo */}
                <Button variant="ghost" className={det.btnInk} href="#prenota">
                  {d.book}
                </Button>
              </Reveal>
            </div>
            <Reveal className={det.headPh} delay={120}>
              <Image
                src={foto('studio-desk', '/img/sections/studio-desk.jpg', 1800, 1800)}
                alt="La regia vista dal centro della sala"
                width={1800}
                height={1800}
                className={det.headImg}
                sizes="(max-width: 860px) 100vw, 50vw"
                priority
              />
            </Reveal>
          </div>
        </header>

        {/* revisione 27/10: via lo scroller delle pagine di sezione da
            questa pagina (SectionPagesNav resta sulle sorelle) */}

        {/* ————— le tre formule: ogni card apre il flusso con la
            formula già scelta (?formula=…#prenota) ————— */}
        <Rule left="01" right={d.formKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.formTitle}
          </Reveal>
          <RevealGroup className={det.grid3}>
            {d.formule.map((f) => (
              <div key={f.n} className={`rv ${styles.formula}`}>
                <span className={`mono ${styles.formulaN}`}>{f.n}</span>
                <h3 className={styles.formulaTitle}>{f.title}</h3>
                <p className={styles.formulaText}>{f.text}</p>
                <ul className={det.cardRows}>
                  {f.rows.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <ArrowLink
                  href={`${base}?formula=${f.id}#prenota`}
                  dir="e"
                  className={styles.formulaGo}
                >
                  {d.formCta}
                </ArrowLink>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— la dotazione: gli spazi da Sanity, in accordion ————— */}
        {dotazione.length > 0 && (
          <>
            <Rule left="02" right={d.findKicker} />
            <section className={`wrap ${det.sez} ${det.duo}`}>
              <Reveal as="h2" className={`display-thin ${det.h2}`}>
                {d.findTitle}
              </Reveal>
              <div>
                <PointsAccordion items={dotazione} plain />
                {/* i marchi citati nella dotazione del mockup: console,
                    monitor, interfacce e software */}
                <BrandRow
                  brands={['ssl', 'genelec', 'dolby', 'avid', 'ableton']}
                />
              </div>
            </section>
          </>
        )}

        {/* ————— tariffe: formule e durate; i prezzi del mockup sono
            tutti da confermare → "su preventivo" ————— */}
        <Rule left="03" right={d.ratesKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.ratesTitle}
          </Reveal>
          <Reveal as="p" className={det.sezLede} delay={80}>
            {d.ratesLede}
          </Reveal>
          <Reveal delay={140}>
            <table className={`listino ${styles.rates}`}>
              <thead>
                <tr>
                  {d.ratesHead.map((h) => (
                    <th key={h} scope="col" className="mono">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.ratesRows.map((r) => (
                  <tr key={r.formula}>
                    {/* la formula è l'intestazione della riga: sul
                        telefono diventa il titolo della voce, e i tre
                        valori si portano l'etichetta della colonna */}
                    <th scope="row" className={styles.ratesName}>
                      {r.formula}
                    </th>
                    <td data-label={d.ratesHead[1]}>{r.durata}</td>
                    <td data-label={d.ratesHead[2]}>{r.include}</td>
                    <td className={styles.ratesPrice} data-label={d.ratesHead[3]}>
                      {r.prezzo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </section>

        {/* ————— come si prenota ————— */}
        <Rule left="04" right={d.howKicker} />
        <section className={`wrap ${det.sez}`}>
          <SectionHeader kicker={d.howKicker} title={d.howTitle} />
          <RevealGroup className={det.grid3}>
            {d.how.map((h) => (
              <Card key={h.title} className="rv" kicker={h.kicker} title={h.title}>
                {h.text}
              </Card>
            ))}
          </RevealGroup>
        </section>

        {/* ————— domande frequenti ————— */}
        <div className={det.faqBand}>
          <Rule left="05" right={d.faqKicker} />
          <section className={`wrap ${det.sez} ${det.duo}`}>
            <Reveal as="h2" className={`display-thin ${det.h2}`}>
              {d.faqTitle}
            </Reveal>
            <PointsAccordion items={d.faq} plain />
          </section>
        </div>

        {/* ————— chiusura: la prenotazione guidata (3 passi) al posto
            del form generico — ancora #prenota per le CTA ————— */}
        <div id="prenota" className={`scheme-dark ${det.dark}`}>
          <section className={`wrap ${det.sez}`}>
            <Reveal as="span" className={`mono ${det.kicker}`}>
              {d.ctaKicker}
            </Reveal>
            <Reveal as="h2" className={`display-thin ${det.ctaTitle}`} delay={60}>
              {d.ctaTitle}
            </Reveal>
            <Reveal as="p" className={det.ctaText} delay={120}>
              {d.ctaText}
            </Reveal>
            {/* la strip di garanzie del mockup (le voci confermate) */}
            <Reveal delay={180}>
              <ul className={styles.garanzie}>
                {d.garanzie.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </Reveal>
            {/* il flusso legge ?formula=…: Suspense per useSearchParams */}
            <Suspense fallback={null}>
              <StudioBookingFlow
                locale={locale}
                labels={d.flow}
                formule={d.formule}
                privacyHref={localeHref(locale, '/privacy')}
                email={email}
                catImages={{
                  produzione: {
                    src: foto('studio-ssl', '/img/foto/studio-ssl.jpg', 1920, 1440),
                    width: 1920,
                    height: 1440,
                    alt: 'La console SSL della regia, vista di lato',
                  },
                  prove: {
                    src: foto('live-band', '/img/foto/live-band.jpg', 1440, 1920),
                    width: 1440,
                    height: 1920,
                    alt: 'Una band al lavoro nella live room',
                  },
                  tour: {
                    src: foto('studio-regia-b', '/img/sections/studio-regia-b.jpg', 1200, 1600),
                    width: 1200,
                    height: 1600,
                    alt: 'La regia dello studio con outboard e monitor',
                  },
                }}
                shopLinks={shopLinks}
              />
            </Suspense>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
