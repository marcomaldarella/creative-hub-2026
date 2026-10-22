import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  Arrow,
  ArrowLink,
  Button,
  Card,
  Reveal,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { ArticleCard } from '@/components/magazine/ArticleCard'
import { ContactForm } from '@/components/sections/ContactForm'
import det from '@/components/sections/DetailPage.module.css'
import { StudioContacts } from '@/components/sections/StudioContacts'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import {
  getAllArticles,
  getArticlesByCategory,
  getSiteSettings,
  getSpacesByKind,
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
    title: t.nav.studio,
    description: t.studios.lede,
    alternates: pageAlternates(locale, '/studios'),
  }
}

export default async function StudiosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const [spaces, settings, studioArticles, allArticles] = await Promise.all([
    getSpacesByKind('studio'),
    getSiteSettings(),
    getArticlesByCategory('produzione-musicale'),
    getAllArticles(),
  ])
  /* due articoli a tema studio: prima la linea produzione musicale,
     poi si completa con gli ultimi del magazine se non bastano */
  const editorial = [
    ...studioArticles,
    ...allArticles.filter(
      (a) => !studioArticles.some((s) => s._id === a._id)
    ),
  ].slice(0, 2)

  /* mockup ott 2026: ogni card servizio porta alla sua pagina — le tre
     ex-ancora (registrazione, mix, affitto) ora sono route vere */
  const services = [
    { ...t.studios.services.recording, href: '/studios/registrazione' },
    { ...t.studios.services.mix, href: '/studios/mix-mastering' },
    { ...t.studios.services.atmos, href: '/studios/dolby-atmos' },
    { ...t.studios.services.cinema, href: '/studios/sound-design' },
    { ...t.studios.services.podcast, href: '/studios/podcast' },
    { ...t.studios.services.rental, href: '/studios/affitto-studio' },
  ]

  return (
    <SiteChrome locale={locale} path="/studios">
      <main className={styles.main}>
        {/* ————— hero ————— */}
        <header className={styles.head}>
          <Reveal className={styles.headMedia}>
            <Image
              src="/img/sections/studio-regia.jpg"
              alt="La regia principale dello studio: console, monitoring e synth"
              width={1800}
              height={1350}
              priority
              className={styles.headImg}
            />
          </Reveal>
          <div className={styles.headText}>
            <Reveal as="span" className={`mono ${styles.kicker}`}>
              {t.studios.kicker}
            </Reveal>
            <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
              {t.studios.title}
            </Reveal>
            <Reveal as="p" className={styles.lede} delay={160}>
              {t.studios.lede}
            </Reveal>
            {/* la CTA dell'hero del mockup: porta al form in fondo */}
            <Reveal className={styles.headCta} delay={220}>
              <Button variant="azzurro" href="#contatti">
                {t.studios.heroCta}
              </Button>
            </Reveal>
          </div>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/studios" current="/studios" />

        <Rule left={t.studios.kicker} right={t.studios.servicesKicker} />

        {/* ————— i servizi st.01–06: nel mockup vengono subito dopo
            l'hero, prima del manifesto e della galleria degli spazi ————— */}
        <section className={styles.sez} id="mix-mastering">
          <div className="wrap">
            <SectionHeader
              kicker={t.studios.servicesKicker}
              title={t.studios.servicesTitle}
              lede={t.studios.servicesLede}
            />
            <div className={styles.services}>
              {services.map((service, i) => (
                <Reveal key={service.n} delay={i * 60}>
                  <Card
                    kicker={service.n}
                    title={service.title}
                    href={localeHref(locale, service.href)}
                    className={styles.spaceCard}
                  >
                    {service.text}
                    {/* le tre righe-specifica del mockup, sotto il testo */}
                    <ul className={det.cardRows}>
                      {service.rows.map((row) => (
                        <li key={row}>{row}</li>
                      ))}
                    </ul>
                    <span className={styles.cardGo}>
                      {t.studios.cardCta}
                      <Arrow dir="e" size={13} />
                    </span>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ————— manifesto + numeri (dal mockup v2): statement grande e
            fascia dati come la home ————— */}
        <section className={`scheme-dark ${styles.sez} ${styles.manifesto}`}>
          <div className="wrap">
            <Reveal as="p" className={`display-thin ${styles.manifestoText}`}>
              {t.studios.manifesto}
            </Reveal>
            <Reveal as="span" className={`mono ${styles.numbersKicker}`} delay={80}>
              {t.studios.numbersKicker}
            </Reveal>
            <div className={styles.numbers}>
              {t.studios.numbers.map((num, i) => (
                <Reveal key={num.n} className={styles.number} delay={i * 60}>
                  <span className={`display-thin ${styles.numberN}`}>{num.n}</span>
                  <span className={styles.numberLabel}>{num.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Rule left={t.studios.servicesKicker} right={t.studios.spacesKicker} />

        {/* ————— le regie, dal vivo: banda fotografica a due colonne ————— */}
        <section className={styles.photoDuo} aria-label="Le regie dello studio">
          <Image
            src="/img/sections/studio-desk.jpg"
            alt="La regia vista dal centro della sala: console, rack e tastiere"
            width={1800}
            height={1800}
            className={styles.duoImg}
          />
          <Image
            src="/img/sections/studio-regia-b.jpg"
            alt="La postazione di lavoro con console SSL e modulari"
            width={1200}
            height={1600}
            className={styles.duoImg}
          />
        </section>

        {/* ————— gli spazi: la galleria "dentro" del mockup ————— */}
        <section className={styles.sez} id="registrazione">
          <div className="wrap">
            <SectionHeader
              kicker={t.studios.spacesKicker}
              title={t.studios.spacesTitle}
              lede={t.studios.spacesLede}
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
                    {/* la grafia delle dotazioni è contenuto: minuscolandole
                        si perdevano SSL, Neumann U87, Genelec */}
                    {space.features && space.features.length > 0 && (
                      <ul className={`mono ${styles.features}`}>
                        {space.features.map((f) => (
                          <li key={f._key}>{l(f, locale)}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ————— perché registrare qui ————— */}
        <section className={styles.sez}>
          <div className="wrap">
            <SectionHeader kicker={t.studios.whyKicker} title={t.studios.whyTitle} />
            <div className={styles.services}>
              {t.studios.why.map((item, i) => (
                <Reveal key={item.n} delay={i * 60}>
                  <Card
                    kicker={`${item.n} ${item.kicker}`}
                    title={item.title}
                    className={styles.spaceCard}
                  >
                    {item.text}
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ————— in regia: lo studio manager ————— */}
        <section className={`${styles.sez} ${styles.engineer}`}>
          <div className="wrap">
            <SectionHeader
              kicker={t.studios.engineerKicker}
              title={t.studios.engineerName}
            />
            <div className={styles.engineerBody}>
              <Reveal as="p" className={`mono ${styles.engineerRole}`}>
                {t.studios.engineerRole}
              </Reveal>
              <Reveal as="p" className={styles.engineerBio} delay={80}>
                {t.studios.engineerBio}
              </Reveal>
              {/* i crediti del fonico: chips hairline (mockup ott 2026) */}
              <Reveal as="p" className={`mono ${styles.creditsLabel}`} delay={120}>
                {t.studios.engineerCreditsLabel}
              </Reveal>
              <Reveal className={styles.credits} delay={160}>
                {t.studios.engineerCredits.map((name) => (
                  <span key={name} className={styles.credit}>
                    {name}
                  </span>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

        {/* ————— tecnologia e partner (mockup ott 2026) ————— */}
        <section className={styles.sez}>
          <div className="wrap">
            <SectionHeader
              kicker={t.studios.techKicker}
              title={t.studios.techTitle}
            />
            <div className={styles.tech}>
              {t.studios.tech.map((name, i) => (
                <Reveal key={name} className={styles.techName} delay={(i % 4) * 50}>
                  {name}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ————— faq ————— */}
        <section className={styles.sez}>
          <div className="wrap">
            <SectionHeader kicker={t.studios.faqKicker} title={t.studios.faqTitle} />
            <PointsAccordion items={t.studios.faq} plain />
          </div>
        </section>

        {/* ————— dal magazine: due articoli a tema studio, fascia nera ————— */}
        {editorial.length > 0 && (
          <section className={`${styles.sez} scheme-dark`}>
            <div className="wrap">
              <SectionHeader
                kicker={t.studios.editorialKicker}
                title={t.studios.editorialTitle}
              />
              <div className={styles.editorialGrid}>
                {editorial.map((article) => (
                  <ArticleCard
                    key={article._id}
                    article={article}
                    locale={locale}
                  />
                ))}
              </div>
              <div className={styles.editorialAll}>
                <ArrowLink href={localeHref(locale, '/magazine')}>
                  {t.home.magazineAll}
                </ArrowLink>
              </div>
            </div>
          </section>
        )}

        {/* ————— chiusura: raccontaci il progetto (mockup ott 2026) —
            stesso modulo delle pagine di dettaglio, con il form vero ————— */}
        {/* l'id storico #affitto-studio resta per i vecchi link; #contatti è
            l'ancora del mockup, su cui puntano le CTA della pagina */}
        <div className={`scheme-dark ${det.dark}`} id="affitto-studio">
          <section className={`wrap ${det.sez} ${det.duo}`} id="contatti">
            <div>
              <Reveal as="h2" className={`display-thin ${det.ctaTitle}`}>
                {t.studios.ctaTitle}
              </Reveal>
              <Reveal as="p" className={det.ctaText} delay={80}>
                {t.studios.ctaText}
              </Reveal>
              <StudioContacts
                email={t.studioSub.email}
                phone={settings?.phone}
                notes={t.studioSub.notes}
              />
            </div>
            {/* il form del mockup: tema preselezionato su "Non lo so ancora" */}
            <Reveal delay={140}>
              <ContactForm
                to={t.studioSub.email}
                subject={t.studios.ctaTitle}
                topics={t.form.studioTopics}
                defaultTopic={t.form.studioTopics[6]}
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
