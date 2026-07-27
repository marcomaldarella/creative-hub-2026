import Link from 'next/link'
import {
  ArrowLink,
  Button,
  Counter,
  CounterRow,
  Marquee,
  PartnerMark,
  Reveal,
  RevealGroup,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { HeroOrb } from '@/components/sections/HeroOrb'
import { HeroWords } from '@/components/sections/HeroWords'
import { HighlightsCarousel } from '@/components/sections/HighlightsCarousel'
import { EcosystemBento } from '@/components/sections/EcosystemBento'
import { MethodCards } from '@/components/sections/MethodCards'
import { NodeCards } from '@/components/sections/NodeCards'
import { ArticleCard } from '@/components/magazine/ArticleCard'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getHomeData } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import styles from './page.module.css'

function fmtLocale(locale: Locale): string {
  return locale === 'it' ? 'it-IT' : 'en-GB'
}

function openDayLabel(date: string | undefined, locale: Locale): string | null {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  const day = new Intl.DateTimeFormat(fmtLocale(locale), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
  const time = new Intl.DateTimeFormat(fmtLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
  return `${day} — ${time}`.toLowerCase()
}

/**
 * La home in due versioni: quella pubblica ('/') e la variante hero
 * raggiungibile a '/home-2' — pin dell'orb sempre visibili in filigrana
 * e caption in basso a sinistra al posto di tagline/lede/CTA.
 */
export async function HomeScreen({
  locale,
  heroV2 = false,
}: {
  locale: Locale
  heroV2?: boolean
}) {
  const t = getDictionary(locale)

  const home = await getHomeData()
  const { settings, latestArticles, partners } = home

  const stats = [
    t.home.stats.students,
    t.home.stats.partners,
    t.home.stats.placement,
    t.home.stats.startups,
  ]

  const partnerMarks = partners
    .map((p) => p.name)
    .filter((name): name is string => Boolean(name))
    .map((name) => <PartnerMark key={name} name={name} />)

  const openDate = openDayLabel(settings?.openDay?.date, locale)
  const openTitle = l(settings?.openDay?.title, locale)
  const openHref = settings?.openDay?.ctaUrl ?? shopHref(settings)

  return (
    <SiteChrome locale={locale} path={heroV2 ? '/home-2' : '/'} dark>
      <main>
        {/* ————— hero ————— */}
        <header
          className={heroV2 ? `${styles.hero} ${styles.heroFit}` : styles.hero}
        >
          <div className={styles.heroAnnot}>
            <span className="mono">{t.hero.since}</span>
            <span className="mono">{t.hero.coords}</span>
          </div>
          <div className={styles.orbStage}>
            <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <path
                  id="hero-ring"
                  d="M 50,50 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0"
                  fill="none"
                />
              </defs>
              <text>
                {/* startOffset: la linea clippa a fine cerchio (0%),
                    il testo parte più avanti → aria prima della c */}
                <textPath href="#hero-ring" startOffset="1.6%">
                  creative · creative-hub · inspire · innovate · excel ·
                  bologna · dal 1999{' '}
                  {/* linea continua alla stessa altezza del type: em-dash
                      senza tracking; l'eccedenza oltre il cerchio è clippata */}
                  <tspan className={styles.ringDash} aria-hidden="true">
                    {'—'.repeat(90)}
                  </tspan>
                </textPath>
              </text>
            </svg>
            <HeroOrb
              className={styles.orb}
              dimPins={heroV2}
              pins={heroV2}
              hrefs={[
                localeHref(locale, '/academy'),
                localeHref(locale, '/coworking'),
                localeHref(locale, '/studios'),
              ]}
            />
            {heroV2 ? (
              <h1 className={`display-black ${styles.heroTitle}`}>
                creative
                <br />
                hub
              </h1>
            ) : (
              /* sfera nuda: le tre anime dell'hub, hover colorato + glow,
                 la sfera dietro si tinge (evento 'hero-tint') */
              <HeroWords
                words={[
                  {
                    label: 'Music Academy',
                    href: localeHref(locale, '/academy'),
                  },
                  { label: 'Rec. Studio', href: localeHref(locale, '/studios') },
                  {
                    label: 'Co-Working',
                    href: localeHref(locale, '/coworking'),
                  },
                ]}
              />
            )}
          </div>
          {heroV2 ? (
            <div className={styles.heroCaption}>
              <p>
                {t.hero.caption}
                <span className={styles.heroCaptionSub}>
                  {t.hero.captionSub}
                </span>
              </p>
            </div>
          ) : (
            <div className={styles.heroSub}>
              <div className={styles.heroSubText}>
                {/* inciso sopra la lede, giustificato a sinistra */}
                <span className={`mono ${styles.tagline}`}>
                  {t.hero.tagline}
                </span>
                <p className={styles.lede}>{t.hero.lede}</p>
              </div>
              <a href="#manifesto" className={styles.heroCta}>
                {t.hero.discover} <span aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </header>

        {/* ————— manifesto: titolo centrale + statement gigante (ref endzeit) ————— */}
        <section className={styles.sez} id="manifesto">
          <div className={`wrap ${styles.manifestoWrap}`}>
            <Reveal as="span" className={`mono ${styles.manifestoKicker}`}>
              {t.home.manifestoRuleRight}
            </Reveal>
            <Reveal
              as="h2"
              className={`display-black ${styles.manifestoStatement}`}
              delay={60}
            >
              {t.home.manifestoNeg}
            </Reveal>
            <RevealGroup className={styles.manifestoCols}>
              <Reveal as="p" delay={120}>
                {t.home.manifestoCol1}
              </Reveal>
              <Reveal as="div" delay={210}>
                <p>{t.home.manifestoCol2}</p>
                <Link
                  href={localeHref(locale, '/chi-siamo')}
                  className={styles.manifestoCta}
                >
                  <span>{t.home.manifestoCta}</span>
                  <span className={styles.manifestoCtaBall} aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12h15" />
                      <path d="M13 5.5 19.5 12 13 18.5" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            </RevealGroup>
          </div>
        </section>

        {/* ————— tre nodi ————— */}
        <section className={`${styles.sez} ${styles.nodesSez}`}>
          <div className="wrap">
            <SectionHeader
              kicker={t.home.ecosystemKicker}
              title={t.home.ecosystemTitle}
            />
            <EcosystemBento
              items={t.home.bento}
              hrefs={[
                localeHref(locale, '/academy'),
                localeHref(locale, '/studios'),
                localeHref(locale, '/coworking'),
              ]}
            />
            <NodeCards
              className={styles.minorNodes}
              cards={t.home.nodeCards}
              hrefs={[
                localeHref(locale, '/innovazione'),
                localeHref(locale, '/magazine'),
                localeHref(locale, '/chi-siamo'),
              ]}
            />
          </div>
        </section>

        {/* ————— metodo (§ 04) ————— */}
        <section className={`${styles.sez} ${styles.methodSez}`}>
          <div className="wrap">
            <Reveal as="span" className={`mono ${styles.methodKicker}`}>
              {t.home.methodKicker}
            </Reveal>
            <Reveal delay={80}>
              <MethodCards
                eyebrow={t.home.methodEyebrow}
                title={t.home.methodTitle}
                items={t.home.method}
              />
            </Reveal>
          </div>
        </section>

        {/* ————— hi-lights carousel (§ 05) ————— */}
        <HighlightsCarousel
          eyebrow={t.home.highlights.eyebrow}
          slides={t.home.highlights.slides}
          hrefs={[
            localeHref(locale, '/studios'),
            localeHref(locale, '/coworking'),
            `${localeHref(locale, '/academy')}?tipo=custom`,
          ]}
        />

        {/* ————— counters: titolo a sinistra (~25%), numeri inline nel resto ————— */}
        <section className={styles.counters}>
          <div className={`wrap ${styles.countersGrid}`}>
            <div>
              <h2 className={`display-black ${styles.countersTitle}`}>
                {t.home.resultsRuleLeft}
              </h2>
              <span className={`mono ${styles.countersYear}`}>
                {t.home.resultsRuleRight}
              </span>
            </div>
            <CounterRow>
              {stats.map((stat) => (
                <Counter
                  key={stat.label}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  formatLocale={fmtLocale(locale)}
                />
              ))}
            </CounterRow>
          </div>
        </section>

        {/* ————— network (§ 06): titolo a sinistra, approfondimento + cta partner a destra ————— */}
        {partnerMarks.length > 0 && (
          <section className={styles.sez}>
            <div className={`wrap ${styles.networkHead}`}>
              <div>
                <Reveal as="span" className={`mono ${styles.networkKicker}`}>
                  {t.home.networkKicker}
                </Reveal>
                <Reveal
                  as="h2"
                  className={`display-thin ${styles.networkTitle}`}
                  delay={80}
                >
                  {t.home.networkTitle}
                </Reveal>
              </div>
              <Reveal as="div" className={styles.networkSide} delay={160}>
                <p>{t.home.networkText}</p>
                <Link
                  href={localeHref(locale, '/chi-siamo#partner')}
                  className={styles.manifestoCta}
                >
                  <span>{t.home.networkCta}</span>
                  <span className={styles.manifestoCtaBall} aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12h15" />
                      <path d="M13 5.5 19.5 12 13 18.5" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            </div>
            <Marquee items={partnerMarks} />
            <div className={`wrap ${styles.networkFoot}`}>
              <span className="mono">{t.home.networkRight}</span>
              <span className="mono">{partnerMarks.length}</span>
            </div>
          </section>
        )}

        {/* ————— magazine ————— */}
        <section className={styles.sez}>
          <div className="wrap">
            <SectionHeader
              kicker={t.home.magazineKicker}
              title={t.home.magazineTitle}
            />
            <RevealGroup className={styles.mag}>
              {latestArticles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  locale={locale}
                  reveal
                />
              ))}
            </RevealGroup>
            <Reveal className={styles.magAll} delay={180}>
              <ArrowLink href={localeHref(locale, '/magazine')}>
                {t.home.magazineAll}
              </ArrowLink>
            </Reveal>
          </div>
        </section>

        {/* ————— open day (azzurro) ————— */}
        <section className={`${styles.sez} ${styles.openday}`}>
          <span className={`mono ${styles.frameL}`} aria-hidden="true">
            {t.home.opendayFrameA}
          </span>
          <span className={`mono ${styles.frameR}`} aria-hidden="true">
            {t.home.opendayFrameB}
          </span>
          <div className={`wrap ${styles.opendayIn}`}>
            <div>
              <span className={`mono ${styles.opendayDate}`}>
                {openDate ?? openTitle}
              </span>
              <h2 className={`display-black ${styles.opendayTitle}`}>
                {t.home.opendayTitleLine1}
                <br />
                {t.home.opendayTitleLine2}
              </h2>
            </div>
            <Button href={openHref} external>
              {t.home.opendayCta}
            </Button>
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}
