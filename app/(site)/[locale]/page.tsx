import { notFound } from 'next/navigation'
import {
  ArrowLink,
  Button,
  Card,
  Counter,
  CounterRow,
  Marquee,
  NodeGrid,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { HeroOrb } from '@/components/sections/HeroOrb'
import { ArticleCard } from '@/components/magazine/ArticleCard'
import { isLocale, localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getHomeData, getSpacesByKind } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const [home, studioSpaces] = await Promise.all([
    getHomeData(),
    getSpacesByKind('studio'),
  ])
  const { settings, latestArticles, partners } = home

  const nodes = [
    { key: 'academy', label: t.nav.academy, href: '/academy', ...t.home.nodes.academy },
    { key: 'studio', label: t.nav.studio, href: '/studios', ...t.home.nodes.studio },
    { key: 'coworking', label: t.nav.coworking, href: '/coworking', ...t.home.nodes.coworking },
    { key: 'innovation', label: t.nav.innovation, href: '/innovazione', ...t.home.nodes.innovation },
    { key: 'magazine', label: t.nav.magazine, href: '/magazine', ...t.home.nodes.magazine },
    { key: 'about', label: t.nav.about, href: '/chi-siamo', ...t.home.nodes.about },
  ].map((n) => ({
    label: n.label,
    title: n.title,
    text: n.text,
    href: localeHref(locale, n.href),
  }))

  const stats = [
    t.home.stats.students,
    t.home.stats.partners,
    t.home.stats.placement,
    t.home.stats.startups,
  ]

  const partnerNames = partners
    .map((p) => p.name)
    .filter((name): name is string => Boolean(name))

  const openDate = openDayLabel(settings?.openDay?.date, locale)
  const openTitle = l(settings?.openDay?.title, locale)
  const openHref = settings?.openDay?.ctaUrl ?? shopHref(settings)

  return (
    <SiteChrome locale={locale} path="/" dark>
      <main>
        {/* ————— hero ————— */}
        <header className={styles.hero}>
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
                <textPath href="#hero-ring">
                  creative · creative-hub · inspire · innovate · excel ·
                  bologna · dal 1999 ·
                </textPath>
              </text>
            </svg>
            <HeroOrb className={styles.orb} />
            <h1 className={`display-black ${styles.heroTitle}`}>
              CREATIVE
              <br />
              HUB
            </h1>
          </div>
          <div className={styles.heroSub}>
            <p className={styles.lede}>{t.hero.lede}</p>
            <span className="mono">{t.hero.tagline}</span>
            <ArrowLink href="#manifesto">{t.hero.discover}</ArrowLink>
          </div>
        </header>

        <Rule left={t.home.manifestoRuleLeft} right={t.home.manifestoRuleRight} />

        {/* ————— manifesto ————— */}
        <section className={styles.sez} id="manifesto">
          <div className="wrap">
            <Reveal as="p" className={styles.manifesto}>
              {t.home.manifestoPre}
              <b>{t.home.manifestoBold}</b>
              {t.home.manifestoPost}
            </Reveal>
          </div>
        </section>

        {/* ————— lo studio (petrolio) ————— */}
        <section className={`${styles.sez} ${styles.studio}`}>
          <div className={`wrap ${styles.studioIn}`}>
            <SectionHeader
              dark
              kicker={t.home.studioKicker}
              title={t.home.studioTitle}
              lede={t.home.studioDesc}
            />
            <div className={styles.cards}>
              {studioSpaces.map((space, i) => (
                <Reveal key={space._id} delay={i * 60}>
                  <Card
                    variant="dark"
                    kicker={`ch.0${i + 1}`}
                    title={l(space.title, locale)}
                    href={localeHref(locale, '/studios')}
                    className={styles.studioCard}
                  >
                    {l(space.summary, locale)}
                  </Card>
                </Reveal>
              ))}
            </div>
            <Reveal className={styles.studioCta} delay={120}>
              <ArrowLink href={localeHref(locale, '/studios')}>
                {t.home.studioCta}
              </ArrowLink>
            </Reveal>
          </div>
        </section>

        {/* ————— sei nodi ————— */}
        <section className={styles.sez}>
          <div className="wrap">
            <SectionHeader
              kicker={t.home.ecosystemKicker}
              title={t.home.ecosystemTitle}
            />
            <NodeGrid nodes={nodes} />
          </div>
        </section>

        <Rule left={t.home.resultsRuleLeft} right={t.home.resultsRuleRight} />

        {/* ————— counters ————— */}
        <section className={styles.sez}>
          <div className="wrap">
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

        {/* ————— marquee partner ————— */}
        {partnerNames.length > 0 && <Marquee items={partnerNames} />}

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
