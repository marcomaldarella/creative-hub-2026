import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLink,
  Button,
  Reveal,
  RevealGroup,
  Rule,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getSiteSettings } from '@/lib/sanity/queries'
import studioSslImg from '@/public/img/foto/studio-ssl.jpg'
import { ContactForm } from '@/components/sections/ContactForm'
import det from '@/components/sections/DetailPage.module.css'
import { StudioContacts } from '@/components/sections/StudioContacts'
import tp from '@/components/sections/TopicScreen.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* etichetta della Rule dal titolo di sezione: via il punto, tutto minuscolo
   (così resta giusta anche in inglese, senza chiavi dedicate) */
const kickerOf = (s: string) => s.replace(/\.+$/, '').toLowerCase()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: t.studioSub.mix.metaTitle,
    description: t.studioSub.mix.metaDesc,
    alternates: pageAlternates(locale, '/studios/mix-mastering'),
  }
}

export default async function MixMasteringPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.studioSub.mix
  const settings = await getSiteSettings()

  const email = t.studioSub.email
  const mailBook = `mailto:${email}?subject=${encodeURIComponent(d.book)}`

  return (
    <SiteChrome locale={locale} path="/studios/mix-mastering">
      <main className={det.main}>
        {/* ————— testata: testo a sinistra, console a destra ————— */}
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
                src={studioSslImg}
                alt="Mani sulla console SSL"
                className={det.headImg}
                sizes="(max-width: 860px) 100vw, 50vw"
                priority
              />
            </Reveal>
          </div>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/studios" current="/studios/mix-mastering" />

        {/* ————— i due servizi: mix e mastering ————— */}
        <Rule left="01" right={d.svcKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.svcTitle}
          </Reveal>
          <RevealGroup className={det.grid2}>
            {d.services.map((s) => (
              <div key={s.n} className={`rv ${tp.cell}`}>
                <span className={`mono ${styles.svcN}`}>{s.n}</span>
                <h3 className={`${tp.cellTitle} ${styles.svcTitle}`}>
                  {s.title}
                </h3>
                <p className={styles.svcLede}>{s.lede}</p>
                <ul className={det.cardRows}>
                  {s.rows.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— come lavoriamo: i cinque passi ————— */}
        <Rule left="02" right={kickerOf(d.howTitle)} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.howTitle}
          </Reveal>
          <RevealGroup className={tp.steps}>
            {d.how.map((h, i) => (
              <div key={h.title} className={`rv ${tp.step}`}>
                <span className={`mono ${tp.stepNum}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={tp.stepTitle}>{h.title}</h3>
                <p className={tp.stepText}>{h.text}</p>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— cosa ci serve ————— */}
        <Rule left="03" right={kickerOf(d.needTitle)} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.needTitle}
          </Reveal>
          <Reveal as="p" className={det.sezLede} delay={60}>
            {d.needLede}
          </Reveal>
          <Reveal as="ul" className={det.check} delay={120}>
            {d.needs.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </Reveal>
        </section>

        {/* ————— promo Dolby Atmos: fascia nera, rimando interno ————— */}
        <div className={`scheme-dark ${det.promo}`}>
          <section className={`wrap ${det.sez}`}>
            <Reveal as="h2" className={`display-thin ${det.promoTitle}`}>
              {d.atmosTitle}
            </Reveal>
            <Reveal as="p" className={det.promoText} delay={80}>
              {d.atmosText}
            </Reveal>
            <Reveal delay={160}>
              <Button
                variant="azzurro"
                href={localeHref(locale, '/studios/dolby-atmos')}
              >
                {d.atmosCta}
              </Button>
            </Reveal>
          </section>
        </div>

        {/* ————— domande frequenti: le voci dei mockup ————— */}
        <Rule left="04" right={kickerOf(d.faqTitle)} />
        <section className={`wrap ${det.sez} ${det.duo}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.faqTitle}
          </Reveal>
          <PointsAccordion items={d.faq} plain />
        </section>

        {/* ————— chiusura: mandaci il brano ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <section className={`wrap ${det.sez} ${det.duo}`}>
            <div>
              <Reveal as="h2" className={`display-thin ${det.ctaTitle}`}>
                {d.ctaTitle}
              </Reveal>
              <Reveal as="p" className={det.ctaText} delay={80}>
                {d.ctaText}
              </Reveal>
              <StudioContacts
                email={email}
                phone={settings?.phone}
                notes={t.studioSub.notes}
              />
            </div>
            {/* il form del mockup: mailto composto, servizio preselezionato */}
            <Reveal delay={140}>
              <ContactForm
                to={email}
                subject={d.ctaTitle}
                topics={t.form.studioTopics}
                defaultTopic={t.form.studioTopics[1]}
                labels={{
                  ...t.form,
                  topic: t.form.topicNeed,
                  messagePlaceholder: t.form.messagePlaceholderStudio,
                }}
                privacyHref={localeHref(locale, '/privacy')}
                sendLabel={t.form.sendRequest}
                company={false}
              />
            </Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
