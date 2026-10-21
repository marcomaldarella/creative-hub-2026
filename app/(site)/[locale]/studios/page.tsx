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
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { ArticleCard } from '@/components/magazine/ArticleCard'
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
          </div>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/studios" current="/studios" />

        <Rule left={t.studios.kicker} right={t.studios.spacesKicker} />

        {/* ————— gli spazi ————— */}
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

        {/* ————— i servizi ch.01–04 ————— */}
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
            <PointsAccordion items={t.studios.faq} />
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
      </main>
    </SiteChrome>
  )
}
