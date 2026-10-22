import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLink, Reveal } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { BookingFlow } from '@/components/sections/BookingFlow'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getBookableProducts } from '@/lib/woocommerce'
import loungeImg from '@/public/img/sections/coworking-lounge.jpg'
import banano2Img from '@/public/img/foto/banano-2.jpg'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* voce del flusso → prodotto WooCommerce: l'uscita secondaria "paga
   online sullo shop" nel riepilogo (il percorso primario è il wizard).
   Ufficio e aula magna non hanno un prodotto: si va solo via richiesta */
const SHOP_SLUGS: Record<string, string> = {
  'day-pass': 'day-pass',
  'dieci-ingressi': 'day-pass-pacchetto-10-ingressi',
  'quick-desk': 'quick-desk',
  'full-desk': 'full-desk',
  'vip-quick-pass': 'vip-quick-pass-annuale',
  'sala-riunioni': 'sala-riunioni',
  'sala-didattica': 'sala-didattica',
  'area-culture': 'area-culture',
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
    title: t.prenota.title,
    description: t.prenota.metaDesc,
    alternates: pageAlternates(locale, '/coworking/prenota'),
  }
}

export default async function PrenotaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  /* catalogo WooCommerce (con fallback locale): serve solo a risolvere i
     permalink reali delle voci che hanno un prodotto sullo shop */
  const products = await getBookableProducts()
  const bySlug = new Map(products.map((p) => [p.slug, p.permalink]))
  const shopLinks = Object.fromEntries(
    Object.entries(SHOP_SLUGS).flatMap(([id, slug]) => {
      const url = bySlug.get(slug)
      return url ? [[id, url] as const] : []
    })
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: t.prenota.title,
    description: t.prenota.metaDesc,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Creative Hub Bologna',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Via del Tappezziere 4',
        postalCode: '40138',
        addressLocality: 'Bologna',
        addressCountry: 'IT',
      },
      telephone: '+39 051 6313706',
    },
    areaServed: 'Bologna',
  }

  return (
    <SiteChrome locale={locale} path="/coworking/prenota">
      <main className={styles.main}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className={`wrap ${styles.head}`}>
          <Reveal className={styles.back}>
            <ArrowLink href={localeHref(locale, '/coworking')} reverse>
              {t.prenota.back}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
            {t.prenota.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={120}>
            {t.prenota.title}
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={180}>
            {t.prenota.lede}
          </Reveal>
          <Reveal delay={240}>
            <ul className={styles.facts}>
              {t.prenota.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Reveal>
        </header>

        <section className={`wrap ${styles.sez}`}>
          {/* il flusso legge ?cat=lavoro|sale: Suspense per useSearchParams */}
          <Suspense fallback={null}>
            <BookingFlow
              locale={locale}
              labels={t.prenota.flow}
              privacyHref={localeHref(locale, '/privacy')}
              catImages={{
                lavoro: {
                  src: loungeImg,
                  alt: 'La lounge del coworking: sedute e grafiche geometriche alle pareti',
                },
                sale: {
                  src: banano2Img,
                  alt: 'La banano room: soffitto industriale e grande banano al centro',
                },
              }}
              shopLinks={shopLinks}
            />
          </Suspense>
        </section>
      </main>
    </SiteChrome>
  )
}
