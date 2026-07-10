import type { Metadata } from 'next'
import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import { Counter, CounterRow, Reveal, Rule, SectionHeader } from '@/components/ui'
import { PortableBlocks } from '@/components/sections/PortableBlocks'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getPageById } from '@/lib/sanity/queries'
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
  return { title: t.nav.innovation, description: t.innovation.fallbackLede }
}

export default async function InnovazionePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const page = await getPageById('innovazione')
  const sections = page?.sections ?? []
  const stats = [t.innovation.stats.startups, t.innovation.stats.partners]

  return (
    <SiteChrome locale={locale} path="/innovazione">
      <main className={styles.main}>
        {/* ————— hero ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal as="span" className={`mono ${styles.kicker}`}>
            {t.nav.innovation}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
            {l(page?.hero?.title, locale) ?? t.innovation.fallbackTitle}
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={160}>
            {l(page?.hero?.lede, locale) ?? t.innovation.fallbackLede}
          </Reveal>
        </header>

        {/* ————— sezioni editoriali ————— */}
        {sections.map((section, i) => (
          <Fragment key={section._key}>
            <Rule
              left={String(i + 1).padStart(2, '0')}
              right={l(section.kicker, locale)?.toLowerCase()}
            />
            <section className={styles.sez}>
              <div className={`wrap ${styles.editorial}`}>
                <SectionHeader
                  kicker={l(section.kicker, locale)?.toLowerCase()}
                  title={l(section.title, locale)}
                  className={styles.sectionHead}
                />
                <Reveal delay={120}>
                  <PortableBlocks value={l(section.body, locale)} />
                </Reveal>
              </div>
            </section>
          </Fragment>
        ))}

        <Rule left={t.innovation.statsRuleLeft} right={t.innovation.statsRuleRight} />

        {/* ————— numeri ————— */}
        <section className={styles.sez}>
          <div className="wrap">
            <CounterRow>
              {stats.map((stat) => (
                <Counter
                  key={stat.label}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  formatLocale={locale === 'it' ? 'it-IT' : 'en-GB'}
                />
              ))}
            </CounterRow>
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}
