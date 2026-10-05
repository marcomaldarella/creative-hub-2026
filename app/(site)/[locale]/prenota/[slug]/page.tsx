import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button, Reveal, Rule } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import {
  formatPrice,
  getBookableProduct,
  getBookableProducts,
} from '@/lib/woocommerce'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const product = await getBookableProduct(slug)
  if (!product) return {}
  const t = getDictionary(locale)
  const price = formatPrice(product.price, locale)
  return {
    title: product.name,
    description: `${t.prenota.title} ${product.name}${price ? ` — ${price}` : ''}`,
    alternates: pageAlternates(locale, `/prenota/${slug}`),
  }
}

export default async function ProdottoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const products = await getBookableProducts()
  const product = products.find((p) => p.slug === slug)
  if (!product) notFound()

  const price = formatPrice(product.price, locale)
  const regular =
    product.onSale && product.regularPrice > product.price
      ? formatPrice(product.regularPrice, locale)
      : ''
  const kicker =
    product.category === 'coworking'
      ? t.prenota.coworkingKicker
      : t.prenota.coplayingKicker
  const others = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3)

  return (
    <SiteChrome locale={locale} path="/prenota">
      <main className={styles.main}>
        {/* ————— testata: foto a filo sx, testi a dx (grammatica /studios) ————— */}
        <header className={styles.head}>
          <Reveal className={styles.headMedia}>
            {product.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.image.src}
                alt={product.image.alt || product.name}
                className={styles.headImg}
              />
            ) : (
              <span className={styles.headPh} aria-hidden />
            )}
          </Reveal>
          <div className={styles.headText}>
            <Reveal as="span" className={`mono ${styles.kicker}`}>
              {t.prenota.kicker} · {kicker}
            </Reveal>
            <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
              {product.name}
            </Reveal>
            <Reveal as="p" className={`mono ${styles.price}`} delay={140}>
              {price ? (
                <>
                  {regular && <s className={styles.regular}>{regular}</s>}
                  {price}
                </>
              ) : (
                t.prenota.onRequest
              )}
            </Reveal>
            {product.shortDescriptionHtml && (
              <Reveal delay={200}>
                <div
                  className={styles.lede}
                  dangerouslySetInnerHTML={{
                    __html: product.shortDescriptionHtml,
                  }}
                />
              </Reveal>
            )}
            <Reveal className={styles.ctas} delay={260}>
              <Button href={product.permalink} external variant="azzurro">
                {t.prenota.book}
              </Button>
              <Button href={localeHref(locale, '/chi-siamo#contatti')}>
                {t.prenota.contact}
              </Button>
            </Reveal>
            <Reveal as="p" className={styles.bookNote} delay={320}>
              {t.prenota.bookNote}
            </Reveal>
          </div>
        </header>

        {/* ————— descrizione dal catalogo WooCommerce ————— */}
        {product.descriptionHtml && (
          <>
            <Rule left={t.prenota.detailsKicker} right={kicker} />
            <section className={styles.sez}>
              <div className={`wrap ${styles.detailsIn}`}>
                <h2 className={styles.detailsTitle}>{t.prenota.detailsTitle}</h2>
                <div
                  className={styles.desc}
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            </section>
          </>
        )}

        {/* ————— altri spazi della stessa famiglia ————— */}
        {others.length > 0 && (
          <section className={`scheme-dark ${styles.sez} ${styles.others}`}>
            <div className="wrap">
              <div className={styles.othersHead}>
                <span className={`mono ${styles.othersKicker}`}>
                  {t.prenota.othersKicker}
                </span>
                <h2 className={styles.othersTitle}>{t.prenota.othersTitle}</h2>
              </div>
              <div className={styles.othersGrid}>
                {others.map((p) => (
                  <Link
                    key={p.id}
                    href={localeHref(locale, `/prenota/${p.slug}`)}
                    className={styles.otherCard}
                  >
                    <span className={styles.otherMedia}>
                      {p.image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.image.src}
                          alt={p.image.alt || p.name}
                          loading="lazy"
                        />
                      )}
                    </span>
                    <span className={styles.otherBody}>
                      <span className={styles.otherName}>{p.name}</span>
                      <span className={`mono ${styles.otherPrice}`}>
                        {formatPrice(p.price, locale) || t.prenota.onRequest}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href={localeHref(locale, '/prenota')}
                className={`mono ${styles.backAll}`}
              >
                {t.prenota.backAll}
              </Link>
            </div>
          </section>
        )}
      </main>
    </SiteChrome>
  )
}
