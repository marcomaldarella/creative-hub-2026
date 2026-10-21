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
import banano1Img from '@/public/img/foto/banano-1.jpg'
/* grammatica condivisa delle pagine di dettaglio (testata con fatti,
   griglie hairline, chiusura nera) + celle/passi delle pagine topic */
import det from '@/components/sections/DetailPage.module.css'
import tp from '@/components/sections/TopicScreen.module.css'
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
    title: t.innovationSub.aziende.metaTitle,
    description: t.innovationSub.aziende.metaDesc,
    alternates: pageAlternates(locale, '/innovazione/aziende'),
  }
}

export default async function AziendePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.innovationSub.aziende
  const settings = await getSiteSettings()

  const mailto = `mailto:hello@bologna-creativehub.it?subject=${encodeURIComponent(d.ctaTitle)}`

  return (
    <SiteChrome locale={locale} path="/innovazione/aziende">
      <main className={det.main}>
        {/* ————— testata: testo e fatti a sinistra, banano room a destra ————— */}
        <header className={`wrap ${det.head}`}>
          <div className={det.headGrid}>
            <div>
              <Reveal className={det.back}>
                <ArrowLink href={localeHref(locale, '/innovazione')} reverse>
                  {t.innovationSub.back}
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
                  <div key={f.t} className={`rv ${det.fact}`}>
                    <span className={det.factT}>{f.t}</span>
                    <span className={det.factS}>{f.s}</span>
                  </div>
                ))}
              </RevealGroup>
              <Reveal className={det.heroRow} delay={140}>
                <Button href={mailto} external className={styles.btnBn}>
                  {d.talk}
                </Button>
              </Reveal>
            </div>
            <Reveal className={det.headPh} delay={100}>
              <Image
                src={banano1Img}
                alt="La banano room: tavolo rotondo e sedute in velluto"
                className={det.headImg}
              />
            </Reveal>
          </div>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/innovazione" current="/innovazione/aziende" />

        {/* ————— i servizi: startup a sinistra, aziende a destra ————— */}
        <Rule left="01" right={d.colsKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.colsTitle}
          </Reveal>
          <div className={det.grid2}>
            {/* colonna startup: blocchi hairline impilati */}
            <div id="startup">
              <Reveal as="span" className={`mono ${tp.groupLabel}`}>
                {d.startupLabel}
              </Reveal>
              <RevealGroup className={`${tp.cells} ${styles.cols1}`}>
                {d.startup.map((b) => (
                  <div key={b.title} className={`rv ${tp.cell}`}>
                    <h3 className={tp.cellTitle}>{b.title}</h3>
                    <p className={tp.cellText}>{b.text}</p>
                  </div>
                ))}
              </RevealGroup>
            </div>
            {/* colonna aziende: scouting con i 4 passi, poi gli altri servizi */}
            <div id="aziende">
              <Reveal as="span" className={`mono ${tp.groupLabel}`}>
                {d.companyLabel}
              </Reveal>
              <RevealGroup className={`${tp.cells} ${styles.cols1}`}>
                <div className={`rv ${tp.cell}`}>
                  <h3 className={tp.cellTitle}>{d.scoutingTitle}</h3>
                  <p className={tp.cellText}>{d.scoutingText}</p>
                  {/* mini-tabella del percorso: numero mono + passo, niente testo */}
                  <div className={`${tp.steps} ${styles.stepsMini}`}>
                    {d.scoutingSteps.map((s, i) => (
                      <div key={s} className={`${tp.step} ${styles.stepRow}`}>
                        <span className={`mono ${tp.stepNum}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={tp.stepTitle}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {d.company.map((b) => (
                  <div key={b.title} className={`rv ${tp.cell}`}>
                    <h3 className={tp.cellTitle}>{b.title}</h3>
                    <p className={tp.cellText}>{b.text}</p>
                  </div>
                ))}
              </RevealGroup>
            </div>
          </div>
        </section>

        {/* ————— glossario: incubatore / acceleratore / startup studio ————— */}
        <Rule left="02" right={d.glossKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.glossTitle}
          </Reveal>
          <Reveal as="p" className={det.sezLede} delay={80}>
            {d.glossLede}
          </Reveal>
          <RevealGroup className={det.grid3}>
            {d.gloss.map((g) => (
              <Card key={g.kicker} className="rv" kicker={g.kicker} title={g.title}>
                {g.text}
              </Card>
            ))}
          </RevealGroup>
          <Reveal className={det.crossRow} delay={120}>
            <span>{d.glossNote}</span>
            <ArrowLink
              href={localeHref(locale, '/innovazione/incubazione-accelerazione')}
            >
              {d.glossCta}
            </ArrowLink>
          </Reveal>
        </section>

        {/* ————— chiusura nera: raccontaci cosa vi serve ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <section className={`wrap ${det.sez}`}>
            <Reveal as="h2" className={`display-thin ${det.ctaTitle}`}>
              {d.ctaTitle}
            </Reveal>
            <Reveal as="p" className={det.ctaText} delay={80}>
              {d.ctaText}
            </Reveal>
            <Reveal className={det.ctaRow} delay={160}>
              <Button href={mailto} external className={styles.btnBn}>
                {d.ctaWrite}
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
              {t.innovation.mailNotes.map((m) => (
                <a key={m.mail} className={det.mailRow} href={`mailto:${m.mail}`}>
                  <span className={det.mailAddr}>{m.mail}</span>
                  <span className={det.mailNote}>{m.note}</span>
                </a>
              ))}
            </Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
