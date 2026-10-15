import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Arrow,
  Button,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { BgVideo } from '@/components/sections/BgVideo'
import {
  ExploreField,
  type ExploreItem,
  type ExploreWord,
} from '@/components/sections/ExploreField'
import { FluidZone } from '@/components/sections/FluidZone'
import { TeacherStrip } from '@/components/sections/TeacherStrip'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { l } from '@/lib/sanity/l'
import type { Course } from '@/lib/sanity/types'
import { getAllCourses, getAllTeachers, getSiteSettings } from '@/lib/sanity/queries'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* le 3 card "scegli il tuo percorso": stessi filtri già usati sopra,
   ma come vetrina editoriale — slug della pagina topic + tipologie
   corso da contare (lib/topics.ts). Ogni card ha la sua clip muta in
   loop (BgVideo, lazy): la foto di prima resta come poster, quindi il
   primo paint è identico e il video arriva solo quando la card entra
   in viewport. Clip già in uso altrove nel sito (home/bento). */
const PATHS = [
  {
    slug: 'corsi-universitari',
    types: ['triennio', 'magistrale'],
    photo: '/img/sections/academy-universitari.jpg',
    video: '/video/node-academy.mp4',
  },
  {
    slug: 'corsi-custom',
    types: ['custom'],
    photo: '/img/sections/academy-custom.jpg',
    video: '/video/hi-corsi.mp4',
  },
  {
    slug: 'formazione-finanziata',
    types: ['finanziato', 'gratuito'],
    photo: '/img/sections/academy-finanziata.jpg',
    video: '/video/node-studio.mp4',
  },
] as const

/* la lista "tutto intorno allo studio": altre 3 pagine topic */
const AROUND = ['stage-placement', 'servizi-studenti', 'open-day'] as const

/* ————— campo esplora: tutta l'offerta in un muro statico di titoli.
   Le foto sono TUTTE della stessa misura (la dimensione vive nel CSS
   del componente); qui si decide solo quali e ogni quanti titoli ————— */
const EXPLORE_PICS = [
  '/img/foto/studio-ssl.jpg',
  '/img/foto/live-band.jpg',
  '/img/foto/sede.jpg',
  '/img/sections/aula-corsi.jpg',
  '/img/foto/corridoio-2.jpg',
  '/img/sections/studio-regia-b.jpg',
] as const

/* una foto ogni quanti titoli */
const EXPLORE_PIC_EVERY = 4

/** avvolge in <strong> i nomi propri dentro un paragrafo (Angela Madonia
 *  ecc.): evita di portare markup nei dizionari JSON. */
function withNames(text: string, names: string[]): ReactNode {
  if (names.length === 0) return text
  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'g')
  return text
    .split(re)
    .map((part, i) => (names.includes(part) ? <strong key={i}>{part}</strong> : part))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: t.nav.academy,
    description: t.academy.lede,
    alternates: pageAlternates(locale, '/academy'),
  }
}

export default async function AcademyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const [courses, teachers, settings] = await Promise.all([
    getAllCourses(),
    getAllTeachers(),
    getSiteSettings(),
  ])

  const basePath = localeHref(locale, '/academy')
  const corsiPath = localeHref(locale, '/academy/corsi')
  const email = settings?.email ?? 'hello@bologna-creativehub.it'

  /* ————— parole del campo esplora: i corsi veri da Sanity più i
     finanziati del dizionario (non ancora in Sanity: puntano alla
     pagina della formazione finanziata). I pool si alternano a giro
     così ogni riga mescola le tipologie invece di raggrupparle ————— */
  const toWord = (c: Course): ExploreWord => {
    const ty = c.types?.[0] as keyof typeof t.academy.types | undefined
    return {
      kind: 'word',
      label: l(c.title, locale) ?? '',
      tag: ty ? t.academy.types[ty] : undefined,
      href: `${basePath}/${c.slug?.current ?? ''}`,
    }
  }
  const pools: ExploreWord[][] = [
    courses
      .filter((c) => c.types?.some((ty) => ty === 'triennio' || ty === 'magistrale'))
      .map(toWord),
    courses.filter((c) => c.types?.includes('custom')).map(toWord),
    t.academy.exploreFunded.map((label) => ({
      kind: 'word' as const,
      label,
      tag: t.academy.exploreFundedTag,
      href: localeHref(locale, '/academy/formazione-finanziata'),
    })),
  ]
  const words: ExploreWord[] = []
  const maxLen = Math.max(...pools.map((p) => p.length))
  for (let i = 0; i < pools.length * maxLen; i++) {
    const w = pools[i % pools.length][Math.floor(i / pools.length)]
    if (w) words.push(w)
  }
  const exploreItems: ExploreItem[] = []
  let picIdx = 0
  words.forEach((w, i) => {
    exploreItems.push(w)
    const caption = t.academy.exploreCaptions[picIdx]
    if (
      (i + 1) % EXPLORE_PIC_EVERY === 0 &&
      picIdx < EXPLORE_PICS.length &&
      caption
    ) {
      exploreItems.push({
        kind: 'pic',
        src: EXPLORE_PICS[picIdx],
        alt: caption,
        caption,
      })
      picIdx++
    }
  })

  return (
    <SiteChrome locale={locale} path="/academy">
      <main className={styles.main}>
        {/* ————— header ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal as="span" className={`mono ${styles.kicker}`}>
            {t.academy.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
            {t.academy.titleLines[0]}{' '}
            <br className={styles.titleBreak} />
            {t.academy.titleLines[1]}
          </Reveal>
          {/* riga alla landing: lede a sinistra, CTA appaiate a destra
              (prenota = pastiglia scura, info = ghost) */}
          <div className={styles.heroRow}>
            <Reveal as="p" className={styles.lede} delay={160}>
              {t.academy.lede}
            </Reveal>
            <Reveal className={styles.heroCtas} delay={220}>
              <Button href={localeHref(locale, '/academy/open-day')}>
                {t.academy.heroCtaPrimary}
              </Button>
              <Button variant="ghost" href={`mailto:${email}`}>
                {t.academy.heroCtaSecondary}
              </Button>
            </Reveal>
          </div>
        </header>

        {/* ————— colata nera: dal percorso alla storia, come nel mock —
            la pagina passa al nero subito dopo l'hero azzurra ————— */}
        <div className={`scheme-dark ${styles.darkBand}`}>
        {/* ————— scegli il tuo percorso ————— */}
        <section className={`wrap ${styles.pathsSez}`}>
          <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
            {t.academy.pathsKicker}
          </Reveal>
          {/* titolone alla mock: ultima riga nell'azzurro di sezione */}
          <Reveal
            as="h2"
            className={`display-black ${styles.pathsTitle}`}
            delay={60}
          >
            {t.academy.pathsTitle[0]}
            <br />
            <span className={styles.pathsTitleAccent}>
              {t.academy.pathsTitle[1]}
            </span>
          </Reveal>
          {/* scia fluida della home sopra le tre foto; il corpo testo
              sta sopra il canvas (z-index) e non si inverte */}
          <FluidZone>
          <RevealGroup className={styles.pathsGrid}>
            {PATHS.map((path, i) => {
              const item = t.academy.pathsItems[i]
              const count = courses.filter((c) =>
                c.types?.some((ty) => (path.types as readonly string[]).includes(ty))
              ).length
              return (
                <Link
                  key={path.slug}
                  href={localeHref(locale, `/academy/${path.slug}`)}
                  className={`rv ${styles.pathCard}`}
                  style={{ '--rvd': `${i * 60}ms` } as CSSProperties}
                >
                  <div className={styles.pathPhotoBox}>
                    {/* clip in loop al posto della foto: la foto resta
                        poster, lo scale in hover vale anche sul video */}
                    <BgVideo
                      src={path.video}
                      poster={path.photo}
                      className={styles.pathPhoto}
                    />
                    {/* titolo SULLA foto (ref landing): scrim al piede
                        per la lettura, numerino in alto, disco-freccia */}
                    <span className={`mono ${styles.pathNum}`}>{`0${i + 1}`}</span>
                    <h3 className={styles.pathTitle}>
                      <span>{item.title}</span>
                      <span className={styles.pathDisc} aria-hidden="true">
                        <Arrow dir="ne" size={16} />
                      </span>
                    </h3>
                  </div>
                  <div className={styles.pathBody}>
                    <p className={styles.pathText}>{item.text}</p>
                    {count > 0 && (
                      <b className={styles.pathCount}>
                        {count} {t.academy.pathsCourses}
                      </b>
                    )}
                  </div>
                </Link>
              )
            })}
          </RevealGroup>
          </FluidZone>
        </section>

        {/* ————— tutto intorno allo studio ————— */}
        <section className={`wrap ${styles.aroundSez}`}>
          <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
            {t.academy.aroundKicker}
          </Reveal>
          <RevealGroup className={styles.aroundList}>
            {AROUND.map((slug, i) => {
              const item = t.academy.aroundItems[i]
              return (
                <Link
                  key={slug}
                  href={localeHref(locale, `/academy/${slug}`)}
                  className={`rv ${styles.aroundRow}`}
                >
                  <span className={`mono ${styles.aroundIdx}`}>{`0${i + 1}`}</span>
                  <span className={styles.aroundBody}>
                    <span className={styles.aroundTitle}>{item.title}</span>
                    <span className={styles.aroundText}>{item.text}</span>
                  </span>
                  <span className={styles.aroundArrow} aria-hidden="true">
                    <Arrow dir="e" size={18} />
                  </span>
                </Link>
              )
            })}
          </RevealGroup>
        </section>

        <Rule dark left={t.academy.aroundKicker} right={t.common.courses} />

          {/* ————— tutta l'offerta: muro statico di titoli con i corsi
              veri e le foto della sede (tutte della stessa misura),
              chiuso dalla barra "vedi tutti i corsi" ————— */}
          <section className={styles.exploreSez}>
            <div className={`wrap ${styles.exploreHead}`}>
              <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
                {t.academy.exploreKicker}
              </Reveal>
              <Reveal
                as="h2"
                className={`display-thin ${styles.exploreTitle}`}
                delay={80}
              >
                {t.academy.exploreTitle}
              </Reveal>
              <Reveal as="p" className={styles.exploreLead} delay={160}>
                {t.academy.exploreLead}
              </Reveal>
            </div>
            <div className="wrap">
              <ExploreField items={exploreItems} />
            </div>
            <Link href={corsiPath} className={styles.allBar}>
              <div className={`wrap ${styles.allBarIn}`}>
                <span className={styles.allBarBody}>
                  <span className={styles.allBarTitle}>
                    {t.academy.exploreAllTitle}
                  </span>
                  <span className={styles.allBarSub}>
                    {t.academy.exploreAllSub}
                  </span>
                </span>
                <span className={styles.allBarDisc} aria-hidden="true">
                  <Arrow dir="e" size={22} />
                </span>
              </div>
            </Link>
          </section>

          <Rule dark left={t.common.courses} right={t.academy.storiaKicker} />

          {/* fascia video a tutto campo (fullshot della landing corso):
              la regia SSL in movimento fa da intestazione alla storia —
              il titolo "Dal 1999" sta SOPRA il video, in basso a sinistra */}
          <section className={styles.filmSez}>
            <BgVideo
              src="/video/hero-5s-1920x1080.mp4"
              portrait="/video/hero-5s-1080x1920.mp4"
              poster="/img/sections/studio-regia.jpg"
              className={styles.filmVideo}
            />
            <div className={`wrap ${styles.filmIn}`}>
              <Reveal as="span" className={`mono ${styles.filmKicker}`}>
                {t.academy.storiaKicker}
              </Reveal>
              <Reveal
                as="h2"
                className={`display-thin ${styles.filmTitle}`}
                delay={80}
              >
                {t.academy.storiaTitle}
              </Reveal>
            </div>
          </section>

          {/* ————— dal 1999: la griglia resta sul nero, il titolo è già
              sulla fascia video qui sopra ————— */}
          <section className={`wrap ${styles.storiaSez}`}>
            <RevealGroup className={styles.storiaGrid}>
              {t.academy.storiaItems.map((item, i) => (
                <div key={item.title} className={styles.storiaItem}>
                  <span className={styles.storiaNum}>{`0${i + 1}`}</span>
                  <h3 className={styles.storiaTitle}>{item.title}</h3>
                  <p className={styles.storiaText}>{item.text}</p>
                </div>
              ))}
            </RevealGroup>
          </section>
        </div>

        <Rule left={t.academy.storiaKicker} right={t.academy.teachersKicker} />

        {/* ————— docenti ————— */}
        <section className={`wrap ${styles.teachersSez}`}>
          <SectionHeader
            kicker={t.academy.teachersKicker}
            title={t.academy.teachersTitle}
          />
          <div className={styles.teachersIntro}>
            {t.academy.teachersIntro.map((p, i) => (
              <Reveal as="p" key={p} delay={i * 60} className={styles.teachersP}>
                {i === 1 ? withNames(p, t.academy.teachersNames) : p}
              </Reveal>
            ))}
          </div>
          <TeacherStrip
            teachers={teachers}
            locale={locale}
            join={{
              label: t.academy.joinUs,
              role: t.academy.joinUsRole,
              href: `mailto:${settings?.email ?? 'hello@bologna-creativehub.it'}?subject=${encodeURIComponent(t.academy.joinUs)}`,
            }}
            labels={{
              prev: t.academy.teachersPrev,
              next: t.academy.teachersNext,
              hint: t.academy.teachersHint,
            }}
          />
          <Reveal className={styles.inMemoria}>
            <h3 className={styles.inMemoriaTitle}>{t.academy.inMemoriaTitle}</h3>
            <p className={styles.inMemoriaText}>{t.academy.inMemoriaText}</p>
          </Reveal>
        </section>

        <Rule left={t.academy.teachersKicker} right={t.academy.orientKicker} />

        {/* ————— orientamento: tre strade per chi non ha ancora
            scelto — open day, colloquio, telefono ————— */}
        <section className={`wrap ${styles.orientSez}`}>
          <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
            {t.academy.orientKicker}
          </Reveal>
          <Reveal
            as="h2"
            className={`display-thin ${styles.orientTitle}`}
            delay={80}
          >
            {t.academy.orientTitle}
          </Reveal>
          <Reveal as="p" className={styles.orientLead} delay={160}>
            {t.academy.orientLead}
          </Reveal>
          <RevealGroup className={styles.orientGrid}>
            {t.academy.orientItems.map((item, i) => {
              const hrefs = [
                localeHref(locale, '/academy/open-day'),
                `mailto:${email}?subject=${encodeURIComponent(item.title)}`,
                'tel:+390516313706',
              ]
              return (
                <div key={item.title} className={`rv ${styles.orientOpt}`}>
                  <span className={`mono ${styles.orientIdx}`}>{`0${i + 1}`}</span>
                  <h3 className={styles.orientOptTitle}>{item.title}</h3>
                  <p className={styles.orientOptText}>{item.text}</p>
                  <div className={styles.orientCta}>
                    <Button href={hrefs[i]}>{item.cta}</Button>
                  </div>
                </div>
              )
            })}
          </RevealGroup>
        </section>
      </main>
    </SiteChrome>
  )
}
