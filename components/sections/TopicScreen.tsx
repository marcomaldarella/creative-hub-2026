import { Fragment, type CSSProperties } from 'react'
import {
  ArrowLink,
  Button,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { PortableBlocks } from '@/components/sections/PortableBlocks'
import { PointsAccordion, type PointsAccordionItem } from '@/components/sections/PointsAccordion'
import { BgVideo } from '@/components/sections/BgVideo'
import { CourseCard } from '@/components/sections/CourseCard'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAllCourses, getPageById, getSiteSettings } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import type { Topic, TopicBase } from '@/lib/topics'
import type { PageId } from '@/lib/sanity/types'
import academyImg from '@/public/img/sections/node-academy.jpg'
import studioImg from '@/public/img/sections/node-studio.jpg'
import spaziImg from '@/public/img/sections/node-spazi.jpg'
import styles from './TopicScreen.module.css'

/** etichetta di sezione mostrata come kicker e nel "torna a" */
const SECTION_KEY = {
  '/academy': 'academy',
  '/studios': 'studio',
  '/coworking': 'coworking',
  '/innovazione': 'innovation',
  '/chi-siamo': 'about',
} as const

/* clip di sezione per la banda video sotto la testata (linguaggio della
   landing corso v3): stessi abbinamenti video/poster già usati da
   bento e carosello della home — nessun file nuovo. Le sezioni senza
   una clip propria (innovazione, chi-siamo) usano il loop istituzionale,
   che ha anche il taglio verticale per il mobile. */
const SECTION_MEDIA: Record<
  TopicBase,
  { src: string; portrait?: string; poster?: string }
> = {
  '/academy': { src: '/video/hi-corsi.mp4', poster: academyImg.src },
  '/studios': { src: '/video/hi-studio.mp4', poster: studioImg.src },
  '/coworking': { src: '/video/node-coworking.mp4', poster: spaziImg.src },
  '/innovazione': {
    src: '/video/creative-hub-8s-1920x1080.mp4',
    portrait: '/video/creative-hub-8s-1080x1920.mp4',
  },
  '/chi-siamo': {
    src: '/video/creative-hub-8s-1920x1080.mp4',
    portrait: '/video/creative-hub-8s-1080x1920.mp4',
  },
}

/* le sezioni "flood" (SiteChrome le dipinge per intero nel colore di
   sezione): lì --accent È il colore pieno e dentro la fascia nera resta
   leggibile — diventa anche inchiostro. Nelle sezioni neutre l'accento
   di default è il petrolio, invisibile sul nero: si passa all'osso. */
const FLOOD_BASES: TopicBase[] = ['/academy', '/studios', '/coworking']

/**
 * La pagina di una voce di menu, nel linguaggio della landing corso v3:
 * testata compatta, banda video full-bleed di sezione, punti e corsi in
 * fascia nera che si alterna al colore della pagina.
 *
 * Il corpo lungo è opzionale e arriva da Sanity: basta creare un documento
 * `page` con pageId uguale allo slug della voce e le sezioni compaiono qui
 * sotto, senza toccare il codice.
 */
export async function TopicScreen({
  locale,
  topic,
}: {
  locale: Locale
  topic: Topic
}) {
  const t = getDictionary(locale)
  const copy = t.topics[topic.key as keyof typeof t.topics] as {
    title: string
    lede: string
    points: (string | PointsAccordionItem)[]
  }
  /* alcuni topic (es. servizi-studenti) hanno punti "ricchi" con testo
     esteso + foto: diventano un accordion invece della riga numerata */
  const richPoints =
    copy.points.length > 0 && typeof copy.points[0] !== 'string'
      ? (copy.points as PointsAccordionItem[])
      : null

  const [courses, page, settings] = await Promise.all([
    topic.courseTypes ? getAllCourses() : Promise.resolve([]),
    getPageById(topic.slug as PageId),
    getSiteSettings(),
  ])

  const elenco = topic.courseTypes
    ? courses.filter((c) => c.types?.some((x) => topic.courseTypes!.includes(x)))
    : []

  const sezione = t.nav[SECTION_KEY[topic.base]]
  const sections = page?.sections ?? []
  const media = SECTION_MEDIA[topic.base]

  /* token della fascia nera: sulle pagine flood l'accento resta il colore
     pieno di sezione (e fa anche da inchiostro sul nero); sulle sezioni
     neutre scheme-dark porta già l'inchiostro a osso, va spostata solo
     la superficie --accent (petrolio su nero = invisibile) */
  const bandVars: CSSProperties = FLOOD_BASES.includes(topic.base)
    ? ({ '--accent-ink': 'var(--accent)' } as CSSProperties)
    : ({ '--accent': 'var(--osso)' } as CSSProperties)

  /* i punti semplici: sui topic CON corsi restano nel colore di pagina
     (la fascia nera subito dopo è quella dei corsi), altrimenti sono
     loro la fascia nera — mai due fasce nere di fila */
  const pointsInBand = copy.points.length > 0 && !topic.courseTypes

  const pointsList = richPoints ? (
    <PointsAccordion items={richPoints} />
  ) : (
    <RevealGroup className={styles.pointsList}>
      {(copy.points as string[]).map((p, i) => (
        <Reveal key={p} delay={(i % 2) * 60} className={styles.point}>
          <span className={`mono ${styles.pointNum}`}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <p className={styles.pointText}>{p}</p>
        </Reveal>
      ))}
    </RevealGroup>
  )

  return (
    <SiteChrome locale={locale} path={topic.base}>
      <main className={styles.main}>
        {/* ————— testata compatta ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal className={styles.back}>
            <ArrowLink href={localeHref(locale, topic.base)} reverse>
              {t.topics.backTo} {sezione.toLowerCase()}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
            {sezione.toLowerCase()}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={120}>
            {/* un \n nel dizionario spezza il titolo su più righe */}
            {copy.title.split('\n').map((line, i) => (
              <span key={i} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </Reveal>
          {copy.lede && (
            <Reveal as="p" className={styles.lede} delay={180}>
              {copy.lede}
            </Reveal>
          )}
        </header>

        {/* punti dei topic con corsi: nel colore di pagina, prima del
            blocco scuro video + fascia corsi */}
        {copy.points.length > 0 && !pointsInBand && (
          <section className={`wrap ${styles.points}`}>{pointsList}</section>
        )}

        {/* ————— banda video full-bleed di sezione ————— */}
        <Reveal className={styles.heroMedia} delay={120}>
          <BgVideo
            src={media.src}
            portrait={media.portrait}
            poster={media.poster}
            className={styles.heroVideo}
          />
        </Reveal>

        {/* ————— punti in fascia nera (topic senza corsi) ————— */}
        {pointsInBand && (
          <section className={`scheme-dark ${styles.band}`} style={bandVars}>
            <div className="wrap">{pointsList}</div>
          </section>
        )}

        {/* ————— corsi della tipologia, in fascia nera ————— */}
        {topic.courseTypes && (
          <section className={`scheme-dark ${styles.band}`} style={bandVars}>
            <div className="wrap">
              <div className={styles.bandHead}>
                <span className="mono">{t.common.courses}</span>
                <span className="mono">
                  {String(elenco.length).padStart(2, '0')}
                </span>
              </div>
              {elenco.length === 0 ? (
                <p className={`mono ${styles.empty}`}>{t.academy.empty}</p>
              ) : (
                <RevealGroup className={styles.grid}>
                  {elenco.map((course, i) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      locale={locale}
                      index={i}
                      href={localeHref(
                        locale,
                        `/academy/${course.slug?.current ?? ''}`
                      )}
                      className="rv"
                      style={{ '--rvd': `${(i % 4) * 60}ms` } as CSSProperties}
                    />
                  ))}
                </RevealGroup>
              )}
            </div>
          </section>
        )}

        {/* ————— corpo lungo, se il cliente lo scrive in Sanity ————— */}
        {sections.map((section, i) => (
          <Fragment key={section._key}>
            <Rule
              left={String(i + 1).padStart(2, '0')}
              right={l(section.kicker, locale)?.toLowerCase()}
            />
            <section className={styles.sez}>
              <div className={`wrap ${styles.editorial}`}>
                <SectionHeader
                  kicker={l(section.kicker, locale)?.toLowerCase()}
                  title={l(section.title, locale)}
                />
                <PortableBlocks value={l(section.body, locale)} />
              </div>
            </section>
          </Fragment>
        ))}

        {/* ————— cta ————— */}
        <section className={`wrap ${styles.cta}`}>
          <Reveal>
            <Button href={shopHref(settings)} external variant="azzurro">
              {t.nav.book}
            </Button>
          </Reveal>
          <Reveal delay={80}>
            <ArrowLink href={localeHref(locale, topic.base)}>
              {t.nav.explore}
            </ArrowLink>
          </Reveal>
        </section>
      </main>
    </SiteChrome>
  )
}
