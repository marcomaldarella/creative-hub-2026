import type { Metadata } from 'next'
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
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getSiteSettings, getSpacesByKind } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import studioDeskImg from '@/public/img/sections/studio-desk.jpg'
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
  const [settings, spaces] = await Promise.all([
    getSiteSettings(),
    getSpacesByKind('studio'),
  ])

  const email = t.studioSub.email
  const mailBook = `mailto:${email}?subject=${encodeURIComponent(d.book)}`
  const mailCta = `mailto:${email}?subject=${encodeURIComponent(d.ctaTitle)}`

  /* la dotazione: gli spazi studio veri da Sanity — senza documenti la
     sezione non compare */
  const dotazione = spaces
    .map((s) => ({
      title: l(s.title, locale) ?? '',
      text: l(s.summary, locale) ?? '',
    }))
    .filter((i) => i.title && i.text)

  return (
    <SiteChrome locale={locale} path="/studios/affitto-studio">
      <main className={det.main}>
        {/* ————— testata: testo a sinistra, regia a destra ————— */}
        <header className={`wrap ${det.head}`}>
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
                <Button variant="azzurro" href={mailBook} external>
                  {d.book}
                </Button>
              </Reveal>
            </div>
            <Reveal className={det.headPh} delay={120}>
              <Image
                src={studioDeskImg}
                alt="La regia vista dal centro della sala"
                className={det.headImg}
                sizes="(max-width: 860px) 100vw, 50vw"
                priority
              />
            </Reveal>
          </div>
        </header>

        {/* ————— le tre formule ————— */}
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
              <PointsAccordion items={dotazione} />
            </section>
          </>
        )}

        {/* ————— come si prenota ————— */}
        <Rule left="03" right={d.howKicker} />
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

        {/* ————— chiusura: scegli le date ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <section className={`wrap ${det.sez}`}>
            <Reveal as="h2" className={`display-thin ${det.ctaTitle}`}>
              {d.ctaTitle}
            </Reveal>
            <Reveal as="p" className={det.ctaText} delay={80}>
              {d.ctaText}
            </Reveal>
            <Reveal className={det.ctaRow} delay={160}>
              <Button variant="azzurro" href={mailCta} external>
                {d.book}
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
            <Reveal className={det.mailRows} delay={220}>
              <a className={det.mailRow} href={`mailto:${email}`}>
                <span className={det.mailAddr}>{email}</span>
                <span className={det.mailNote}>
                  Via del Tappezziere 4, Bologna
                </span>
              </a>
            </Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
