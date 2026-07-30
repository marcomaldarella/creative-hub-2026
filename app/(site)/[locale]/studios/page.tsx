import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  Anchors,
  ArrowLink,
  Button,
  Card,
  Reveal,
  Rule,
  SectionHeader,
} from '@/components/ui'
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
  return { title: t.nav.studio, description: t.studios.lede }
}

export default async function StudiosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const [spaces, settings] = await Promise.all([
    getSpacesByKind('studio'),
    getSiteSettings(),
  ])

  const services = [
    t.studios.services.recording,
    t.studios.services.mix,
    t.studios.services.atmos,
    t.studios.services.cinema,
  ]

  return (
    <SiteChrome locale={locale} path="/studios">
      <main className={styles.main}>
        {/* ————— hero ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal as="span" className={`mono ${styles.kicker}`}>
            {t.studios.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
            {t.studios.title}
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={160}>
            {t.studios.lede}
          </Reveal>
        </header>

        <Rule left={t.studios.kicker} right={t.studios.spacesKicker} />

        {/* ————— gli spazi ————— */}
        <section className={styles.sez} id="registrazione">
          <div className="wrap">
            <SectionHeader
              kicker={t.studios.spacesKicker}
              title={t.studios.spacesTitle}
            />
            <div className={styles.spaces}>
              {spaces.map((space, i) => (
                <Reveal key={space._id} delay={(i % 3) * 60}>
                  <Card
                    kicker={`s.0${i + 1}`}
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

        <Rule left={t.studios.spacesKicker} right={t.studios.servicesKicker} />

        <Anchors ids={['dolby-atmos', 'sound-design', 'podcast']} />

        {/* ————— i servizi ch.01–04 ————— */}
        <section className={styles.sez} id="mix-mastering">
          <div className="wrap">
            <SectionHeader
              kicker={t.studios.servicesKicker}
              title={t.studios.servicesTitle}
            />
            <div className={styles.services}>
              {services.map((service, i) => (
                <Reveal key={service.n} delay={i * 60}>
                  <Card
                    kicker={service.n}
                    title={service.title}
                    className={styles.spaceCard}
                  >
                    {service.text}
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ————— cta ————— */}
        <section className={`${styles.sez} ${styles.cta}`} id="affitto-studio">
          <div className="wrap">
            <SectionHeader
              kicker={t.studios.ctaKicker}
              title={t.studios.ctaTitle}
              lede={t.studios.ctaText}
            />
            <Reveal className={styles.ctaRow} delay={160}>
              <Button variant="azzurro" href={shopHref(settings)} external>
                {t.studios.ctaBook}
              </Button>
              {settings?.email && (
                <ArrowLink
                  href={`mailto:${settings.email}`}
                  external
                  className={styles.ctaMail}
                >
                  {t.studios.ctaContact}
                </ArrowLink>
              )}
            </Reveal>
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}
