import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button, Reveal, Rule, SectionHeader } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import {
  formatPrice,
  getBookableProducts,
  type WcProduct,
} from '@/lib/woocommerce'
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
    title: t.prenota.title,
    description: t.prenota.lede,
    alternates: pageAlternates(locale, '/prenota'),
  }
}

function ProductCard({
  product,
  locale,
  index,
}: {
  product: WcProduct
  locale: 'it' | 'en'
  index: number
}) {
  const t = getDictionary(locale)
  const price = formatPrice(product.price, locale)
  return (
    <Reveal delay={(index % 3) * 60}>
      <Link
        href={localeHref(locale, `/prenota/${product.slug}`)}
        className={styles.card}
      >
        <span className={styles.cardMedia}>
          {product.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.image.src}
              alt={product.image.alt || product.name}
              loading="lazy"
            />
          )}
        </span>
        <span className={styles.cardBody}>
          <span className={styles.cardTitle}>{product.name}</span>
          <span className={`mono ${styles.cardPrice}`}>
            {price || t.prenota.onRequest}
          </span>
        </span>
      </Link>
    </Reveal>
  )
}

export default async function PrenotaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const products = await getBookableProducts()
  const coworking = products.filter((p) => p.category === 'coworking')
  const coplaying = products.filter((p) => p.category === 'coplaying')

  return (
    <SiteChrome locale={locale} path="/prenota">
      <main className={styles.main}>
        <header className={`wrap ${styles.head}`}>
          <Reveal as="span" className={`mono ${styles.kicker}`}>
            {t.prenota.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
            {t.prenota.title}
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={160}>
            {t.prenota.lede}
          </Reveal>
        </header>

        <Rule left={t.prenota.kicker} right={t.prenota.coworkingKicker} />

        <section className={styles.sez} id="coworking">
          <div className="wrap">
            <SectionHeader
              kicker={t.prenota.coworkingKicker}
              title={t.prenota.coworkingTitle}
            />
            <p className={styles.sezText}>{t.prenota.coworkingText}</p>
            <div className={styles.grid}>
              {coworking.map((p, i) => (
                <ProductCard key={p.id} product={p} locale={locale} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className={`scheme-dark ${styles.sez} ${styles.dark}`} id="coplaying">
          <div className="wrap">
            <SectionHeader
              kicker={t.prenota.coplayingKicker}
              title={t.prenota.coplayingTitle}
            />
            <p className={styles.sezText}>{t.prenota.coplayingText}</p>
            <div className={styles.grid}>
              {coplaying.map((p, i) => (
                <ProductCard key={p.id} product={p} locale={locale} index={i} />
              ))}
            </div>
            <div className={styles.note}>
              <p>{t.prenota.bookNote}</p>
              <Button href={localeHref(locale, '/chi-siamo#contatti')}>
                {t.prenota.contact}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}
