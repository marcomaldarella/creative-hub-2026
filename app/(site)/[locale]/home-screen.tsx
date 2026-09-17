import Link from 'next/link'
import {
  Arrow,
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
import { ParallaxMedia } from '@/components/sections/ParallaxMedia'
import { HeroSlider } from '@/components/sections/HeroSlider'
import { HighlightsCarousel } from '@/components/sections/HighlightsCarousel'
import { PhotoFull, PhotoSplit } from '@/components/sections/Photo'
import { EcosystemBento } from '@/components/sections/EcosystemBento'
import { MethodCards } from '@/components/sections/MethodCards'
import { NodeCards } from '@/components/sections/NodeCards'
import { ArticleCard } from '@/components/magazine/ArticleCard'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getHomeData } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import studioSslImg from '@/public/img/foto/studio-ssl.jpg'
import liveBandImg from '@/public/img/foto/live-band.jpg'
import sedeImg from '@/public/img/foto/sede.jpg'
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
 * La home: hero swiper a tre voci su video (modello Indaco, approvato
 * 2026-09-17). L'hero a sfera è passato a /innovazione, /home-2 ora
 * redirige qui.
 */
export async function HomeScreen({ locale }: { locale: Locale }) {
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
    // niente flag dark: la hero segue il tema, la nav deve invertirsi con lui
    <SiteChrome locale={locale} path="/">
      <main>
        {/* parallasse leggero sulle foto grandi */}
        <ParallaxMedia />
        {/* ————— hero: swiper a tre voci su video con annotazioni,
            approvato dal cliente 2026-09-17 (l'orb è passato a
            /innovazione); le clip sono i cut già in libreria dei nodi */}
        <HeroSlider
            annot={[t.hero.since, t.hero.coords]}
            caption={{
              tagline: t.hero.tagline,
              text: t.hero.caption,
              sub: t.hero.captionSub,
            }}
            cta={{ label: t.hero.discover, href: '#manifesto' }}
            slides={[
              {
                title: t.home.bento[0].title,
                text: t.home.bento[0].text,
                href: localeHref(locale, '/academy'),
                video: '/video/node-academy.mp4',
                accent: 'var(--azzurro-ink)',
              },
              {
                title: t.home.bento[1].title,
                text: t.home.bento[1].text,
                href: localeHref(locale, '/studios'),
                video: '/video/node-studio.mp4',
                accent: 'var(--arancio)',
              },
              {
                title: t.home.bento[2].title,
                text: t.home.bento[2].text,
                href: localeHref(locale, '/coworking'),
                video: '/video/node-coworking.mp4',
                accent: 'var(--giallo-fluo)',
              },
            ]}
          />

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
        {/* fascia nera unica: dalle tre aree fino a "Storie di mestiere"
            (esclusa) — sfondo nero, testi e cose bianche */}
        <div className="scheme-dark">
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

        {/* ————— foto: la regia SSL, a tutta pagina ————— */}
        <PhotoFull
          src={studioSslImg}
          alt="La regia dello studio di registrazione del Creative Hub, con console SSL, monitor da studio e sintetizzatori"
          kicker={t.home.photoStudio.kicker}
          caption={t.home.photoStudio.caption}
          video={{
            src: '/video/hero-5s-1920x1080.mp4',
            portrait: '/video/hero-5s-1080x1920.mp4',
          }}
        />

        {/* ————— metodo (§ 04) ————— */}
        <section className={`${styles.sez} ${styles.methodSez}`}>
          <div className="wrap">
            <Reveal as="span" className={`mono ${styles.methodKicker}`}>
              {t.home.methodKicker}
            </Reveal>
            <Reveal delay={80}>
              <MethodCards title={t.home.methodTitle} items={t.home.method} />
            </Reveal>
          </div>
        </section>

        {/* ————— foto verticale: la live room in funzione ————— */}
        <section className={styles.sez}>
          <PhotoSplit
            src={liveBandImg}
            alt="Studenti del Creative Hub che suonano dal vivo nella live room: voce, chitarre, batteria e tastiere"
            kicker={t.home.photoLive.kicker}
            title={t.home.photoLive.title}
            text={t.home.photoLive.text}
          />
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
        </div>

        {/* ————— magazine ————— */}
        <section className={styles.sez}>
          <div className="wrap">
            <SectionHeader
              kicker={t.home.magazineKicker}
              title={t.home.magazineTitle}
            />
            <RevealGroup className={styles.mag}>
              {latestArticles.map((article, i) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  locale={locale}
                  reveal
                  /* card piatte senza scatola, e foto di sede al posto
                     dei gradient placeholder */
                  flat
                  fallbackSrc={
                    [
                      '/img/foto/studio-ssl.jpg',
                      '/img/foto/live-band.jpg',
                      '/img/foto/sede.jpg',
                    ][i % 3]
                  }
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
            <Button href={openHref} external variant="osso">
              {t.home.opendayCta}
            </Button>
          </div>
        </section>

        {/* ————— l'ingresso della sede: ultima immagine prima del footer ————— */}
        <PhotoFull
          src={sedeImg}
          alt="L'ingresso della sede del Creative Hub Bologna in via del Tappezziere 4"
          kicker={t.home.photoSede.kicker}
          caption={t.home.photoSede.caption}
          height="band"
        />
      </main>
    </SiteChrome>
  )
}
