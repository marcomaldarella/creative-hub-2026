import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLink,
  Button,
  Card,
  Reveal,
  RevealGroup,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { ContactForm } from '@/components/sections/ContactForm'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getSiteSettings } from '@/lib/sanity/queries'
import banano1Img from '@/public/img/foto/banano-1.jpg'
/* grammatica condivisa delle pagine di dettaglio (mockup ott 2026):
   qui lavora in bianco/nero puro, nessun accento */
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
    title: t.innovation.metaTitle,
    description: t.innovation.metaDesc,
    alternates: pageAlternates(locale, '/innovazione'),
  }
}

export default async function InnovazionePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const settings = await getSiteSettings()


  return (
    <SiteChrome locale={locale} path="/innovazione">
      <main className={det.main}>
        {/* ————— testata: testo a sinistra, banano room a destra ————— */}
        <header className={`wrap ${det.head}`}>
          <div className={det.headGrid}>
            <div>
              <Reveal as="span" className={`mono ${det.kicker}`}>
                {t.innovation.kicker}
              </Reveal>
              <Reveal as="h1" className={`display-thin ${det.title}`} delay={60}>
                {t.innovation.title}
              </Reveal>
              <Reveal as="p" className={det.lede} delay={120}>
                {t.innovation.lede}
              </Reveal>
              <Reveal className={det.heroRow} delay={180}>
                <Button variant="ghost" className={styles.btnSolid} href="#percorsi">
                  {t.innovation.heroCta}
                </Button>
              </Reveal>
            </div>
            <Reveal className={det.headPh} delay={120}>
              <Image
                src={banano1Img}
                alt="La banano room: tavolo rotondo e sedute attorno al grande banano"
                priority
                sizes="(max-width: 860px) 100vw, 50vw"
                className={det.headImg}
              />
            </Reveal>
          </div>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/innovazione" current="/innovazione" />

        {/* ————— da dove parti: i quattro percorsi ————— */}
        <section id="percorsi" className={`wrap ${det.sez} ${styles.sezTight}`}>
          <SectionHeader
            kicker={t.innovation.startKicker}
            title={t.innovation.startTitle}
            lede={t.innovation.startLede}
          />
          <div className={det.grid2}>
            {t.innovation.paths.map((p, i) => (
              <Reveal key={p.n} delay={(i % 2) * 80}>
                {/* la prima card (in.01) è il percorso in evidenza: nera */}
                <article
                  className={
                    i === 0
                      ? `scheme-dark ${styles.path} ${styles.pathDark}`
                      : styles.path
                  }
                >
                  <div className={`mono ${styles.pathMeta}`}>
                    <span>{p.n}</span>
                    <span>{p.tag}</span>
                  </div>
                  <h3 className={styles.pathTitle}>{p.title}</h3>
                  <p className={styles.pathText}>{p.text}</p>
                  {p.badge && (
                    <span className={`mono ${styles.badge}`}>{p.badge}</span>
                  )}
                  <div className={styles.pathCta}>
                    <ArrowLink href={localeHref(locale, p.href)}>
                      {p.cta}
                    </ArrowLink>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ————— manifesto: statement grande su bianco ————— */}
        <section className={`wrap ${styles.manifesto}`}>
          <Reveal as="p" className={`display-thin ${styles.manifestoText}`}>
            {t.innovation.manifesto}
          </Reveal>
        </section>

        {/* ————— i tre campi di lavoro ————— */}
        <section className={`wrap ${det.sez}`}>
          <SectionHeader
            kicker={t.innovation.fieldsKicker}
            title={t.innovation.fieldsTitle}
          />
          <div className={det.grid3}>
            {t.innovation.fields.map((f, i) => (
              <Reveal key={f.kicker} delay={i * 60}>
                <Card kicker={f.kicker} title={f.title}>
                  {f.text}
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ————— i numeri: fascia nera ————— */}
        <section className={`scheme-dark ${det.sez}`}>
          <div className="wrap">
            <Reveal as="span" className={`mono ${styles.numbersKicker}`}>
              {t.innovation.numbersKicker}
            </Reveal>
            <div className={styles.numbers}>
              {t.innovation.numbers.map((num, i) => (
                <Reveal key={num.n} className={styles.number} delay={i * 80}>
                  <span className={`display-thin ${styles.numberN}`}>
                    {num.n}
                  </span>
                  <span className={styles.numberLabel}>{num.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ————— l'ecosistema: le altre anime dell'hub ————— */}
        <section className={`wrap ${det.sez}`}>
          <SectionHeader
            kicker={t.innovation.ecoKicker}
            title={t.innovation.ecoTitle}
            lede={t.innovation.ecoLede}
          />
          <div className={det.grid3}>
            {t.innovation.eco.map((e, i) => (
              <Reveal key={e.kicker} delay={i * 60}>
                <Card kicker={e.kicker} title={e.title}>
                  <p>{e.text}</p>
                  <div className={styles.cardCta}>
                    <ArrowLink href={localeHref(locale, e.href)}>
                      {e.cta}
                    </ArrowLink>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ————— partner ————— */}
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {t.innovation.partnersTitle}
          </Reveal>
          <RevealGroup className={det.partners}>
            {t.innovation.partners.map((p) => (
              <span key={p} className={`rv ${det.partner}`}>
                {p}
              </span>
            ))}
          </RevealGroup>
        </section>

        {/* ————— chiusura: parliamo del tuo progetto ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <section className={`wrap ${det.sez} ${det.duo}`}>
            <div>
              <Reveal as="span" className={`mono ${det.kicker}`}>
                {t.innovation.ctaKicker}
              </Reveal>
              <Reveal as="h2" className={`display-thin ${det.ctaTitle}`} delay={60}>
                {t.innovation.ctaTitle}
              </Reveal>
              <Reveal as="p" className={det.ctaText} delay={120}>
                {t.innovation.ctaText}
              </Reveal>
              <div className={det.mailRows}>
                {t.innovation.mailNotes.map((m) => (
                  <a key={m.mail} href={`mailto:${m.mail}`} className={det.mailRow}>
                    <span className={det.mailAddr}>{m.mail}</span>
                    <span className={det.mailNote}>{m.note}</span>
                  </a>
                ))}
                {settings?.phone && (
                  <a
                    className={det.mailRow}
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  >
                    <span className={det.mailAddr}>{settings.phone}</span>
                  </a>
                )}
              </div>
            </div>
            {/* il form del mockup: mailto composto, tema preselezionato */}
            <Reveal delay={140}>
              <ContactForm
                to="hello@bologna-creativehub.it"
                subject={t.innovation.ctaTitle}
                topics={t.form.innovationTopics}
                defaultTopic={t.form.innovationTopics[0]}
                labels={{ ...t.form, topic: t.form.topicTalk }}
                privacyHref={localeHref(locale, '/privacy')}
              />
            </Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
