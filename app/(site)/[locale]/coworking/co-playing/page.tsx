import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLink, Button, Reveal, RevealGroup, Rule } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { formatPrice, getBookableProducts } from '@/lib/woocommerce'
import det from '@/components/sections/DetailPage.module.css'
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
    title: t.coplaying.metaTitle,
    description: t.coplaying.metaDesc,
    alternates: pageAlternates(locale, '/coworking/co-playing'),
  }
}

/* pagina categoria del co-playing (richiesta 23/11): raccoglie TUTTI
   gli spazi della famiglia co-playing del catalogo WooCommerce — sale
   prove, drum box, production box, main stage, live room — così si
   vedono anche da dentro il co-playing e non solo dal percorso di
   prenotazione. Ogni card apre la scheda interna /prenota/[slug], che
   è il punto dove si prenota davvero. */
export default async function CoPlayingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const products = await getBookableProducts()
  const spazi = products.filter((p) => p.category === 'coplaying')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.coplaying.spacesTitle,
    description: t.coplaying.metaDesc,
    itemListElement: spazi.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://bologna-creativehub.it${localeHref(locale, `/prenota/${p.slug}`)}`,
    })),
  }

  return (
    <SiteChrome locale={locale} path="/coworking/co-playing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={`${det.main} ${det.mainNeutral}`}>
        <SectionPagesNav
          locale={locale}
          base="/coworking"
          current="/coworking/co-playing"
        />

        {/* ————— testata ————— */}
        <header className={`wrap ${det.head}`}>
          <div>
            <Reveal className={det.back}>
              <ArrowLink href={localeHref(locale, '/coworking')} reverse>
                {t.coplaying.back}
              </ArrowLink>
            </Reveal>
            <Reveal as="span" className={`mono ${det.kicker}`} delay={60}>
              {t.coplaying.kicker}
            </Reveal>
            <Reveal as="h1" className={`display-thin ${det.title}`} delay={120}>
              {t.coplaying.title}
            </Reveal>
            <Reveal as="p" className={det.lede} delay={180}>
              {t.coplaying.lede}
            </Reveal>
          </div>
        </header>

        {/* ————— cos'è il co-playing ————— */}
        <Rule left="01" right={t.coplaying.introKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {t.coplaying.introTitle}
          </Reveal>
          {t.coplaying.introText.map((p, i) => (
            <Reveal as="p" key={p} className={det.sezLede} delay={80 + i * 60}>
              {p}
            </Reveal>
          ))}
        </section>

        {/* ————— la griglia degli spazi, dal catalogo ————— */}
        <Rule left="02" right={t.coplaying.spacesKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {t.coplaying.spacesTitle}
          </Reveal>
          {spazi.length > 0 ? (
            <RevealGroup className={styles.grid}>
              {spazi.map((p) => (
                <Link
                  key={p.id}
                  href={localeHref(locale, `/prenota/${p.slug}`)}
                  className={`rv ${styles.card}`}
                >
                  <span className={styles.media}>
                    {p.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.image.src}
                        alt={p.image.alt || p.name}
                        loading="lazy"
                      />
                    )}
                  </span>
                  <span className={styles.body}>
                    <span className={styles.name}>{p.name}</span>
                    <span className={`mono ${styles.price}`}>
                      {formatPrice(p.price, locale) || t.prenota.onRequest}
                    </span>
                    <span className={`mono ${styles.cta}`}>
                      {t.coplaying.cardCta}
                    </span>
                  </span>
                </Link>
              ))}
            </RevealGroup>
          ) : (
            <Reveal as="p" className={det.sezLede} delay={80}>
              {t.coplaying.empty}
            </Reveal>
          )}
        </section>

        {/* ————— e poi: tutto il resto dell'hub ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <Rule left="03" right={t.coplaying.allKicker} />
          <section className={`wrap ${det.sez}`}>
            <Reveal as="h2" className={`display-thin ${det.h2}`}>
              {t.coplaying.allTitle}
            </Reveal>
            <Reveal as="p" className={det.sezLede} delay={80}>
              {t.coplaying.allText}
            </Reveal>
            <Reveal className={styles.allRow} delay={140}>
              <Button
                variant="ghost"
                className={det.btnPill}
                href={localeHref(locale, '/coworking/prenota')}
              >
                {t.coplaying.allCta}
              </Button>
              <ArrowLink
                href={localeHref(locale, '/studios/affitto-studio')}
                dir="e"
              >
                {t.coplaying.studioCta}
              </ArrowLink>
            </Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
