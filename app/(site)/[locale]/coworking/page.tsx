import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button, Card, Reveal, Rule, SectionHeader } from '@/components/ui'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getSiteSettings, getSpacesByKind } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
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
  return { title: t.nav.coworking, description: t.coworking.lede }
}

export default async function CoworkingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const [spaces, settings] = await Promise.all([
    getSpacesByKind('coworking'),
    getSiteSettings(),
  ])

  return (
    <SiteChrome locale={locale} path="/coworking">
      <main className={styles.main}>
        {/* ————— hero ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal as="span" className={`mono ${styles.kicker}`}>
            {t.coworking.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
            {t.coworking.title}
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={160}>
            {t.coworking.lede}
          </Reveal>
        </header>

        <Rule left={t.coworking.kicker} right={t.coworking.spacesKicker} />


        {/* ————— gli spazi ————— */}
        <section className={styles.sez} id="coworking">
          <div className="wrap">
            <SectionHeader
              kicker={t.coworking.spacesKicker}
              title={t.coworking.spacesTitle}
            />
            <div className={styles.spaces}>
              {spaces.map((space, i) => (
                <Reveal key={space._id} delay={(i % 3) * 60}>
                  <Card
                    kicker={`cw.0${i + 1}`}
                    title={l(space.title, locale)}
                    className={styles.spaceCard}
                  >
                    <p className={styles.spaceSummary}>
                      {l(space.summary, locale)}
                    </p>
                    {space.features && space.features.length > 0 && (
                      <ul className={`mono ${styles.features}`}>
                        {space.features.map((f) => (
                          <li key={f._key}>{l(f, locale)?.toLowerCase()}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

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
            <Button href={shopHref(settings)} external>
              {t.coworking.ctaDayPass}
            </Button>
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}
