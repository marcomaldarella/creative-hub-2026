import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLink, Button, Card, Reveal, RevealGroup, Rule } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getSiteSettings } from '@/lib/sanity/queries'
import sedeImg from '@/public/img/foto/sede.jpg'
import det from '@/components/sections/DetailPage.module.css'
import tp from '@/components/sections/TopicScreen.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* etichetta delle Rule derivata dal titolo di sezione: minuscola e senza
   punto finale, così resta giusta anche in inglese */
const ruleLabel = (s: string) => s.replace(/\.$/, '').toLowerCase()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const c = getDictionary(locale).innovationSub.cte
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: pageAlternates(locale, '/innovazione/cte-cobo'),
  }
}

export default async function CteCoboPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const c = t.innovationSub.cte
  const settings = await getSiteSettings()

  const ctaMailto = `mailto:hello@bologna-creativehub.it?subject=${encodeURIComponent(c.ctaTitle)}`

  return (
    <SiteChrome locale={locale} path="/innovazione/cte-cobo">
      <main className={det.main}>
        {/* ————— testata: testo e fatti a sinistra, la sede a destra ————— */}
        <header className={`wrap ${det.head}`}>
          <div className={det.headGrid}>
            <div>
              <Reveal className={det.back}>
                <ArrowLink href={localeHref(locale, '/innovazione')} reverse>
                  {t.innovationSub.back}
                </ArrowLink>
              </Reveal>
              <Reveal as="span" className={`mono ${det.kicker}`} delay={60}>
                {c.kicker}
              </Reveal>
              <Reveal as="h1" className={`display-thin ${det.title}`} delay={120}>
                {c.title}
              </Reveal>
              <Reveal as="p" className={det.lede} delay={180}>
                {c.lede}
              </Reveal>
              <RevealGroup className={det.facts}>
                {c.facts.map((f) => (
                  <div key={f.t} className={`rv ${det.fact}`}>
                    <span className={det.factT}>{f.t}</span>
                    <span className={det.factS}>{f.s}</span>
                  </div>
                ))}
              </RevealGroup>
              <Reveal className={det.heroRow} delay={120}>
                <Button
                  variant="ghost"
                  className={styles.btnInk}
                  href={ctaMailto}
                  external
                >
                  {c.ctaWrite}
                </Button>
                <ArrowLink href={c.siteUrl} external dir="e">
                  {c.siteCta}
                </ArrowLink>
              </Reveal>
            </div>
            <Reveal className={det.headPh} delay={100}>
              <Image
                src={sedeImg}
                alt="La sede di via del Tappezziere 4"
                className={det.headImg}
                priority
                sizes="(max-width: 860px) 100vw, 50vw"
              />
            </Reveal>
          </div>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/innovazione" current="/innovazione/cte-cobo" />

        {/* ————— il progetto ————— */}
        <Rule left="01" right={c.introKicker} />
        <section className={`wrap ${det.sez}`}>
          <div className={det.duo}>
            <Reveal as="h2" className={`display-thin ${det.h2}`}>
              {c.introTitle}
            </Reveal>
            <Reveal as="p" className={tp.sezP} delay={80}>
              {c.intro}
            </Reveal>
          </div>
          <RevealGroup className={`${det.grid3} ${styles.cellsGrid}`}>
            {c.cells.map((cell) => (
              <Card
                key={cell.title}
                className="rv"
                kicker={cell.kicker}
                title={cell.title}
              >
                {cell.text}
              </Card>
            ))}
          </RevealGroup>
        </section>

        {/* ————— le attività: gli otto work package ————— */}
        <Rule left="02" right={ruleLabel(c.wpTitle)} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {c.wpTitle}
          </Reveal>
          <Reveal as="p" className={det.sezLede} delay={60}>
            {c.wpLede}
          </Reveal>
          <RevealGroup className={det.partners}>
            {c.wps.map((wp, i) => (
              <div key={wp} className={`rv ${det.partner}`}>
                <span className={`mono ${styles.wpNum}`}>WP{i + 1}</span>
                {wp}
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— la rete: i tredici partner ————— */}
        <Rule left="03" right={c.partnersKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {c.partnersTitle}
          </Reveal>
          <RevealGroup className={det.partners}>
            {c.partners.map((p) => (
              <div key={p} className={`rv ${det.partner}`}>
                {p}
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— finanziamento: nota istituzionale ————— */}
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${styles.finTitle}`}>
            {c.finTitle}
          </Reveal>
          <Reveal as="p" className={det.fin} delay={80}>
            {c.finText}
          </Reveal>
        </section>

        {/* ————— chiusura: scrivici ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <section className={`wrap ${det.sez}`}>
            <Reveal as="h2" className={`display-thin ${det.ctaTitle}`}>
              {c.ctaTitle}
            </Reveal>
            <Reveal as="p" className={det.ctaText} delay={80}>
              {c.ctaText}
            </Reveal>
            <Reveal className={det.ctaRow} delay={160}>
              <Button
                variant="ghost"
                className={styles.btnInk}
                href={ctaMailto}
                external
              >
                {c.ctaWrite}
              </Button>
              {settings?.phone && (
                <ArrowLink
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  external
                >
                  {settings.phone}
                </ArrowLink>
              )}
            </Reveal>
            <RevealGroup className={det.mailRows}>
              {t.innovation.mailNotes.map((m) => (
                <div key={m.mail} className={`rv ${det.mailRow}`}>
                  <a className={det.mailAddr} href={`mailto:${m.mail}`}>
                    {m.mail}
                  </a>
                  <span className={det.mailNote}>{m.note}</span>
                </div>
              ))}
            </RevealGroup>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
