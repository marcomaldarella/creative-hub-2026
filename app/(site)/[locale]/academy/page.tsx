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
  type ExploreCard,
} from '@/components/sections/ExploreField'
import { FluidZone } from '@/components/sections/FluidZone'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { PathsSlider } from '@/components/sections/PathsSlider'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { l } from '@/lib/sanity/l'
import { urlFor } from '@/lib/sanity/image'
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
    /* due CUT DIVERSI della stessa clip (ffmpeg): sessione di canto
       qui, mani sui pad sulla card custom — mai la stessa scena */
    video: '/video/percorso-uni.mp4',
  },
  {
    slug: 'corsi-custom',
    types: ['custom'],
    photo: '/img/sections/academy-custom.jpg',
    video: '/video/percorso-custom.mp4',
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

/* ————— campo esplora: tre marquee a coppie parola/foto — ogni titolo
   ha la SUA immagine (la cover del corso da Sanity; per i finanziati,
   che in Sanity non esistono ancora, le foto della sede a giro).
   Le foto sono TUTTE della stessa misura (dimensione nel CSS) ————— */
/* foto SCELTE per corso (ordine = exploreFunded nei dizionari):
   niente giro cieco, ogni finanziato ha un'immagine pertinente */
const EXPLORE_FUNDED_PICS = [
  '/img/foto/studio-ssl.jpg' /* Digital Composer and Producer */,
  '/img/foto/live-band.jpg' /* Songwriter & Vocal Artist */,
  '/img/sections/node-innovazione.jpg' /* Tecnico modellatore 3D */,
  '/img/sections/studio-regia-b.jpg' /* Multimedia Sound Designer */,
  '/img/sections/studio-regia.jpg' /* Sound design immersivo */,
] as const
/* rete di sicurezza per corsi Sanity senza cover */
const EXPLORE_FALLBACK = '/img/foto/sede.jpg'

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

  /* titoletti numerati come in home ("02 — Metodo"): il numero vive
     qui — e qui si alza anche l'iniziale, così i dizionari e le Rule
     restano minuscoli */
  const cap = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`
  const kick = (n: number, label: string) => `0${n} — ${cap(label)}`

  /* ————— card del campo esplora: i corsi veri da Sanity (cover,
     titolo, summary, tipologia) più i finanziati del dizionario (non
     ancora in Sanity: puntano alla pagina della formazione finanziata
     e pescano le foto della sede, a giro). I pool si alternano così
     ogni riga mescola le tipologie invece di raggrupparle ————— */
  const toCard = (c: Course): ExploreCard => {
    const ty = c.types?.[0] as keyof typeof t.academy.types | undefined
    return {
      label: l(c.title, locale) ?? '',
      tag: ty ? t.academy.types[ty] : undefined,
      meta: t.academy.exploreCardMeta,
      sub: l(c.summary, locale) ?? undefined,
      href: `${basePath}/${c.slug?.current ?? ''}`,
      img: c.coverImage
        ? urlFor(c.coverImage).width(680).height(480).fit('crop').auto('format').url()
        : '',
    }
  }
  const pools: ExploreCard[][] = [
    courses
      .filter((c) => c.types?.some((ty) => ty === 'triennio' || ty === 'magistrale'))
      .map(toCard),
    courses.filter((c) => c.types?.includes('custom')).map(toCard),
    t.academy.exploreFunded.map((label, i) => ({
      label,
      tag: t.academy.exploreFundedTag,
      meta: t.academy.exploreCardMeta,
      sub: t.academy.exploreFundedSubs[i],
      href: localeHref(locale, '/academy/formazione-finanziata'),
      img: EXPLORE_FUNDED_PICS[i] ?? EXPLORE_FALLBACK,
    })),
  ]
  const cards: ExploreCard[] = []
  const maxLen = Math.max(...pools.map((p) => p.length))
  for (let i = 0; i < pools.length * maxLen; i++) {
    const c = pools[i % pools.length][Math.floor(i / pools.length)]
    if (c) cards.push(c)
  }
  /* 3 righe; un corso Sanity senza cover pesca la foto della sede */
  const exploreRows: ExploreCard[][] = [[], [], []]
  cards.forEach((c, i) => {
    exploreRows[i % exploreRows.length].push(
      c.img ? c : { ...c, img: EXPLORE_FALLBACK }
    )
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
            {kick(1, t.academy.pathsKicker)}
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
          <FluidZone className={styles.fluidBleed}>
          <RevealGroup>
          {/* su mobile il CSS trasforma la griglia in slider snap:
              PathsSlider aggiunge solo l'autoplay ogni 7s */}
          <PathsSlider className={styles.pathsGrid}>
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
                    {/* tutto DENTRO la card: titolo sempre visibile al
                        piede, testo e conteggio si scoprono solo in
                        hover (grid-rows 0fr→1fr, niente misure);
                        su touch restano visibili */}
                    <span className={`mono ${styles.pathNum}`}>{`0${i + 1}`}</span>
                    <div className={styles.pathOverlay}>
                      <h3 className={styles.pathTitle}>
                        <span>{item.title}</span>
                        <span className={styles.pathDisc} aria-hidden="true">
                          <Arrow dir="ne" size={16} />
                        </span>
                      </h3>
                      <div className={styles.pathReveal}>
                        <div className={styles.pathRevealIn}>
                          <p className={styles.pathText}>{item.text}</p>
                          {count > 0 && (
                            <b className={styles.pathCount}>
                              {count}{' '}
                              {count === 1
                                ? t.academy.pathsCourse
                                : t.academy.pathsCourses}
                            </b>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </PathsSlider>
          </RevealGroup>
          </FluidZone>
        </section>
        {/* ————— la colata nera continua: 02, Rule e poi l'offerta
            (che è nera di suo) — l'azzurro torna dopo ————— */}

        {/* ————— tutto intorno allo studio ————— */}
        <section className={`wrap ${styles.aroundSez}`}>
          <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
            {kick(2, t.academy.aroundKicker)}
          </Reveal>
          {/* split sul ritmo della griglia sopra: titolo largo quanto
              la prima colonna, le tre card nelle due colonne restanti */}
          <div className={styles.aroundSplit}>
          <Reveal
            as="h2"
            className={`display-thin ${styles.aroundTitle}`}
            delay={60}
          >
            {t.academy.aroundTitle}
          </Reveal>
          {/* card affiancate SENZA foto, linguaggio delle card in home:
              superficie piena, numerino, disco-freccia, titolo al piede */}
          <RevealGroup className={styles.aroundGrid}>
            {AROUND.map((slug, i) => {
              const item = t.academy.aroundItems[i]
              return (
                <Link
                  key={slug}
                  href={localeHref(locale, `/academy/${slug}`)}
                  className={`rv ${styles.aroundCard}`}
                  style={{ '--rvd': `${i * 60}ms` } as CSSProperties}
                >
                  <span className={`mono ${styles.aroundIdx}`}>{`0${i + 1}`}</span>
                  <span className={styles.aroundArrow} aria-hidden="true">
                    <Arrow dir="ne" size={16} />
                  </span>
                  <span className={styles.aroundCardTitle}>{item.title}</span>
                  <span className={styles.aroundText}>{item.text}</span>
                </Link>
              )
            })}
          </RevealGroup>
          </div>
        </section>

        </div>

          {/* ————— tutta l'offerta: muro statico di titoli con i corsi
              veri e le foto della sede (tutte della stessa misura),
              chiuso dalla barra "vedi tutti i corsi". Fascia NERA:
              scheme-dark ribalta i token e dipinge il fondo ————— */}
          <section className={`scheme-dark ${styles.exploreSez}`}>
            <div className={`wrap ${styles.exploreHead}`}>
              <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
                {kick(3, t.academy.exploreKicker)}
              </Reveal>
              <Reveal
                as="h2"
                className={`display-thin ${styles.exploreTitle}`}
                delay={80}
              >
                {t.academy.exploreTitle}
              </Reveal>
            </div>
            <ExploreField rows={exploreRows} />
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
                {kick(4, t.academy.storiaKicker)}
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

        <Rule left={cap(t.academy.storiaKicker)} right={cap(t.academy.teachersKicker)} />

        {/* ————— docenti: fascia NERA, ritratti sempre in bianco e
            nero (il colore torna in hover) ————— */}
        <div className={`scheme-dark ${styles.darkBand}`}>
          <section className={`wrap ${styles.teachersSez}`}>
            <SectionHeader
              kicker={kick(5, t.academy.teachersKicker)}
              title={t.academy.teachersTitle}
            />
            <div className={styles.teachersIntro}>
              {t.academy.teachersIntro.map((p, i) => (
                <Reveal as="p" key={p} delay={i * 60} className={styles.teachersP}>
                  {i === 1 ? withNames(p, t.academy.teachersNames) : p}
                </Reveal>
              ))}
            </div>
            {/* toggle senza JS (come ThemeToggle): la checkbox davanti
                alla griglia pilota via CSS il blocco espandibile e il
                testo della label dopo la griglia. "Vedi tutti" apre il
                resto della griglia con l'espansione 0fr→1fr (28/10) */}
            <input
              type="checkbox"
              id="tutti-docenti"
              className={styles.teachersAllToggle}
            />
            <ul className={styles.teacherGrid}>
              {teachers
                .filter((teacher) => teacher.photo)
                .slice(0, 12)
                .map((teacher) => (
                  <li key={teacher._id} className={styles.teacherCell}>
                    <div className={styles.teacherPh}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={urlFor(teacher.photo!)
                          .width(400)
                          .height(500)
                          .fit('crop')
                          .auto('format')
                          .url()}
                        alt={teacher.name ?? ''}
                        loading="lazy"
                      />
                    </div>
                    <span className={styles.teacherName}>{teacher.name}</span>
                  </li>
                ))}
            </ul>
            {/* il resto dei docenti vive in un blocco che si apre
                (grid-template-rows 0fr→1fr + dissolvenza) */}
            <div className={styles.teachersRest}>
              <div className={styles.teachersRestClip}>
                <ul className={`${styles.teacherGrid} ${styles.teacherGridRest}`}>
                  {teachers
                    .filter((teacher) => teacher.photo)
                    .slice(12)
                    .map((teacher) => (
                      <li key={teacher._id} className={styles.teacherCell}>
                        <div className={styles.teacherPh}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={urlFor(teacher.photo!)
                              .width(400)
                              .height(500)
                              .fit('crop')
                              .auto('format')
                              .url()}
                            alt={teacher.name ?? ''}
                            loading="lazy"
                          />
                        </div>
                        <span className={styles.teacherName}>
                          {teacher.name}
                        </span>
                      </li>
                    ))}
                  {/* i docenti senza ritratto, con la UI della cella
                      join us — box 4:5 col ruolo dentro, nome sotto */}
                  {teachers
                    .filter((teacher) => !teacher.photo)
                    .map((teacher) => (
                      <li key={teacher._id} className={styles.teacherCell}>
                        <span className={styles.joinBox}>
                          <span>{l(teacher.role, locale)}</span>
                        </span>
                        <span className={styles.teacherName}>
                          {teacher.name}
                        </span>
                      </li>
                    ))}
                  {/* join us come un docente: box 4:5 col solo invito al
                      cv (in hover spunta il +), "join us" sotto come
                      fosse il nome; il clic porta ai contatti */}
                  <li className={styles.teacherCell}>
                    <Link
                      className={styles.joinCell}
                      href={`${localeHref(locale, '/chi-siamo')}#contatti`}
                    >
                      <span className={styles.joinBox}>
                        <span>{t.academy.joinUsRole}</span>
                      </span>
                      <span className={styles.teacherName}>
                        {t.academy.joinUs}
                      </span>
                    </Link>
                  </li>
                  {/* in memoria riempie lo spazio avanzato dell'ultima
                      riga: blocco testuale a destra, ancorato in basso */}
                  <li className={styles.memoriaCell}>
                    <h3 className={styles.inMemoriaTitle}>
                      {t.academy.inMemoriaTitle}
                    </h3>
                    <p className={styles.inMemoriaText}>
                      {t.academy.inMemoriaText}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <label
              htmlFor="tutti-docenti"
              className={styles.teachersToggleLab}
            >
              <span className={styles.teachersMore}>
                {t.academy.teachersAll} ({teachers.length})
              </span>
              <span className={styles.teachersLess}>
                {t.academy.teachersLess}
              </span>
            </label>
          </section>
        </div>

        {/* ————— orientamento: tre strade per chi non ha ancora
            scelto — open day, colloquio, telefono ————— */}
        <section className={`wrap ${styles.orientSez}`}>
          <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
            {kick(6, t.academy.orientKicker)}
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

        {/* ————— domande frequenti (dal mockup v2) ————— */}
        <section className={`wrap ${styles.faqSez}`}>
          <Reveal as="span" className={`mono ${styles.sectionLabel}`}>
            {kick(7, t.academy.faqKicker)}
          </Reveal>
          <Reveal
            as="h2"
            className={`display-thin ${styles.faqTitle}`}
            delay={80}
          >
            {t.academy.faqTitle}
          </Reveal>
          {/* plain: risposte brevi, niente foto/placeholder nel pannello */}
          <PointsAccordion items={t.academy.faq} plain />
        </section>

      </main>
    </SiteChrome>
  )
}
