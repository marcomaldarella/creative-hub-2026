import { notFound } from 'next/navigation'
import {
  ArrowLink,
  Button,
  Counter,
  CounterRow,
  Marquee,
  PartnerMark,
  NodeGrid,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { HeroOrb } from '@/components/sections/HeroOrb'
import { StudioFocus } from '@/components/sections/StudioFocus'
import { ArticleCard } from '@/components/magazine/ArticleCard'
import { isLocale, localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getHomeData } from '@/lib/sanity/queries'
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

  const home = await getHomeData()
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

  const partnerMarks = partners
    .map((p) => p.name)
    .filter((name): name is string => Boolean(name))
    .map((name) => <PartnerMark key={name} name={name} />)

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

        {/* ————— metodo (§ 04) ————— */}
        <section className={styles.sez}>
          <div className="wrap">
            <Reveal as="span" className={`mono ${styles.methodKicker}`}>
              {t.home.methodKicker}
            </Reveal>
            <RevealGroup className={styles.method}>
              {t.home.method.map((m, i) => (
                <Reveal key={m.n} className={styles.methodItem} delay={i * 90}>
                  <span className={`mono ${styles.methodN}`}>I/{m.n}</span>
                  <h3 className={styles.methodTitle}>{m.title}</h3>
                  <p className={styles.methodText}>{m.text}</p>
                </Reveal>
              ))}
            </RevealGroup>
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

        {/* ————— focus studio SSL (§ 06) ————— */}
        <StudioFocus
          eyebrow={t.home.studioFocus.eyebrow}
          titleA={t.home.studioFocus.titleA}
          titleB={t.home.studioFocus.titleB}
          desc={t.home.studioFocus.desc}
          services={t.home.studioFocus.services}
          ctaLabel={t.home.studioFocus.cta}
          ctaHref={localeHref(locale, '/studios')}
          captionLeft={t.home.studioFocus.captionLeft}
          captionRight={t.home.studioFocus.captionRight}
        />

        {/* ————— network (§ 07): marquee partner ————— */}
        {partnerMarks.length > 0 && (
          <section className={styles.sez}>
            <div className="wrap">
              <SectionHeader
                kicker={t.home.networkKicker}
                title={t.home.networkTitle}
              />
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
