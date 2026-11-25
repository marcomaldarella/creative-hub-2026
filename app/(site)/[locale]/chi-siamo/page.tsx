import type { Metadata } from 'next'
import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import { Button, Reveal, Rule, SectionHeader } from '@/components/ui'
import { PartnerGrid } from '@/components/sections/PartnerGrid'
import { PortableBlocks } from '@/components/sections/PortableBlocks'
import { TeacherGrid } from '@/components/sections/TeacherGrid'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import {
  getAllPartners,
  getAllTeachers,
  getPageById,
  getSiteSettings,
} from '@/lib/sanity/queries'
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
  return {
    title: t.nav.about,
    description: t.about.fallbackLede,
    alternates: pageAlternates(locale, '/chi-siamo'),
  }
}

export default async function ChiSiamoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const [page, teachers, partners, settings] = await Promise.all([
    getPageById('chi-siamo'),
    getAllTeachers(),
    getAllPartners(),
    getSiteSettings(),
  ])

  const sections = page?.sections ?? []
  const partnerNames = partners
    .map((p) => p.name)
    .filter((name): name is string => Boolean(name))
  const contactLines = [
    settings?.address ?? t.footer.address,
    settings?.phone,
    settings?.email,
  ].filter((line): line is string => Boolean(line))

  return (
    <SiteChrome locale={locale} path="/chi-siamo">
      <main className={styles.main}>
        {/* ————— hero ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal as="span" className={`mono ${styles.kicker}`}>
            {t.nav.about}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
            {l(page?.hero?.title, locale) ?? t.about.fallbackTitle}
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={160}>
            {l(page?.hero?.lede, locale) ?? t.about.fallbackLede}
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

        <Rule left={t.about.teamKicker} />

        {/* ————— le persone —————
            griglia ripristinata il 25/11 su richiesta (era stata sospesa
            a nov 2026 per nominativi non più attivi: la curatela ora
            passa da Sanity — chi non deve apparire si toglie da lì) */}
        <section className={styles.sez} id="team">
          <div className="wrap">
            <SectionHeader kicker={t.about.teamKicker} title={t.about.teamTitle} />
            <TeacherGrid teachers={teachers} locale={locale} />
          </div>
        </section>

        {/* ————— partner (ancora del submenu e della cta in home) ————— */}
        {partnerNames.length > 0 && (
          <div id="partner">
            <Rule left={t.about.partnersRuleLeft} right={t.about.partnersRuleRight} />
            <section className={styles.sez}>
              <div className="wrap">
                {/* 25/11: stessa tabella della home — sei per riga, 4:3 */}
                <PartnerGrid names={partnerNames} columns={6} />
              </div>
            </section>
          </div>
        )}

        {/* ————— contatti ————— */}
        <section className={styles.sez} id="contatti">
          <div className={`wrap ${styles.contacts}`}>
            <div>
              <SectionHeader
                kicker={t.about.contactsKicker}
                title={t.about.contactsTitle}
                lede={t.about.contactsText}
                className={styles.contactsHead}
              />
              <Reveal as="address" className={`mono ${styles.contactLines}`} delay={160}>
                {contactLines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </Reveal>
            </div>
            <Reveal delay={220}>
              <Button href={shopHref(settings)} external>
                {t.nav.book}
              </Button>
            </Reveal>
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}
