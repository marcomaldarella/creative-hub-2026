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
import corridoio1Img from '@/public/img/foto/corridoio-1.jpg'
import det from '@/components/sections/DetailPage.module.css'
import tp from '@/components/sections/TopicScreen.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* candidatura: stesso mailto ovunque in pagina (testata, fascia di stato) */
const APPLY_MAILTO =
  'mailto:info@createch.it?subject=Candidatura%20CreaTech%20Venture%20Club'

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
  const c = getDictionary(locale).innovationSub.createch
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: pageAlternates(locale, '/innovazione/incubazione-accelerazione'),
  }
}

export default async function IncubazioneAccelerazionePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const c = t.innovationSub.createch
  const settings = await getSiteSettings()

  const ctaMailto = `mailto:info@createch.it?subject=${encodeURIComponent(c.ctaTitle)}`

  return (
    <SiteChrome locale={locale} path="/innovazione/incubazione-accelerazione">
      <main className={det.main}>
        {/* ————— testata: testo e fatti a sinistra, foto a destra ————— */}
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
              <Reveal delay={120}>
                <Button
                  variant="ghost"
                  className={styles.btnInk}
                  href={APPLY_MAILTO}
                  external
                >
                  {c.apply}
                </Button>
              </Reveal>
            </div>
            <Reveal className={det.headPh} delay={100}>
              <Image
                src={corridoio1Img}
                alt="Corridoio delle aule con segnaletica gialla"
                className={det.headImg}
                priority
                sizes="(max-width: 860px) 100vw, 50vw"
              />
            </Reveal>
          </div>
        </header>

        {/* ————— fascia di stato: candidature aperte ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <div className={`wrap ${det.status}`}>
            <Reveal as="span" className={det.statusText}>
              {c.status}
            </Reveal>
            <Button
              variant="ghost"
              className={`${styles.btnInk} ${styles.btnSm}`}
              href={APPLY_MAILTO}
              external
            >
              {c.apply}
            </Button>
          </div>
        </div>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/innovazione" current="/innovazione/incubazione-accelerazione" />

        {/* ————— il programma ————— */}
        <Rule left="01" right={c.introKicker} />
        <section className={`wrap ${det.sez} ${det.duo}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {c.introTitle}
          </Reveal>
          <Reveal delay={80}>
            {c.intro.map((p) => (
              <p key={p} className={tp.sezP}>
                {p}
              </p>
            ))}
          </Reveal>
        </section>

        {/* ————— per chi è ————— */}
        <Rule left="02" right={ruleLabel(c.whoTitle)} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {c.whoTitle}
          </Reveal>
          <RevealGroup className={det.grid3}>
            {c.who.map((w) => (
              <Card key={w.title} className="rv" kicker={w.kicker} title={w.title}>
                {w.text}
              </Card>
            ))}
          </RevealGroup>
        </section>

        {/* ————— il percorso: tabella dei passi ————— */}
        <Rule left="03" right={c.howKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {c.howTitle}
          </Reveal>
          <RevealGroup className={tp.steps}>
            {c.how.map((step, i) => (
              <div key={step.title} className={`rv ${tp.step}`}>
                <span className={`mono ${tp.stepNum}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={tp.stepTitle}>{step.title}</h3>
                <p className={tp.stepText}>{step.text}</p>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— cosa ottieni: checklist su due colonne ————— */}
        <Rule left="04" right={ruleLabel(c.getTitle)} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {c.getTitle}
          </Reveal>
          <RevealGroup as="ul" className={det.check}>
            {c.gets.map((g) => (
              <li key={g} className="rv">
                {g}
              </li>
            ))}
          </RevealGroup>
        </section>

        {/* ————— chi lo organizza ————— */}
        <Rule left="05" right={c.orgKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {c.orgTitle}
          </Reveal>
          <RevealGroup className={tp.cells}>
            {c.org.map((o) => (
              <div key={o.name} className={`rv ${tp.cell}`}>
                <span className={`mono ${styles.orgRole}`}>{o.role}</span>
                <h3 className={tp.cellTitle}>{o.name}</h3>
                <p className={tp.cellText}>{o.text}</p>
              </div>
            ))}
          </RevealGroup>
          <Reveal>
            <span className={det.supportLabel}>{c.supportLabel}</span>
            <p className={det.support}>{c.support.join(' · ')}</p>
          </Reveal>
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

        {/* ————— chiusura: candidati ————— */}
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
