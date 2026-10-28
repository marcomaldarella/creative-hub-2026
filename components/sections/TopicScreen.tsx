import { Fragment, type CSSProperties } from 'react'
import {
  ArrowLink,
  Button,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { AvvisamiForm } from '@/components/sections/AvvisamiForm'
import { courseHref } from '@/lib/courses'
import { FundingBand } from '@/components/sections/FundingBand'
import { PortableBlocks } from '@/components/sections/PortableBlocks'
import { PointsAccordion, type PointsAccordionItem } from '@/components/sections/PointsAccordion'
import Link from 'next/link'
import { BgVideo } from '@/components/sections/BgVideo'
import { Thumb } from '@/components/sections/Thumb'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
/* stesse card a foto piena della landing universitari: il modulo si
   condivide, la UI resta UNA */
import uni from '@/components/sections/UniScreen.module.css'
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

/* dal portable text alla struttura disegnata: il corpo scritto in
   Sanity viene letto per forma e ricostruito nella grammatica del
   sito — paragrafi, righe etichetta—testo (• col label in grassetto),
   etichette di gruppo (h4), card in griglia hairline (h3 + testo),
   FAQ ad accordion (tutte domande), tabella numerata (1. 2. 3.).
   Le sezioni con immagini inline restano al renderer libero. */
type Def = { label?: string; text: string }
type Cell = { title: string; text: string; defs: Def[] }
type IdxCard = { label?: string; title: string; text?: string; anchor: string }
type ShapeItem =
  | { kind: 'p'; text: string }
  | { kind: 'label'; text: string }
  | { kind: 'defs'; defs: Def[] }
  | { kind: 'cells'; cells: Cell[] }
  | { kind: 'table'; caption?: string; columns: string[]; rows: string[][] }
  | { kind: 'chips'; label?: string; items: string[] }
  | {
      kind: 'index'
      cards: { label?: string; title: string; text?: string; anchor: string }[]
    }
  | { kind: 'index'; cards: IdxCard[] }

function shapeBody(blocks?: unknown[] | null): ShapeItem[] | null {
  if (!blocks || blocks.length === 0) return null
  const items: ShapeItem[] = []
  let cell: Cell | null = null
  let pendingLabel: string | null = null

  const lastDefs = () => {
    const last = items[items.length - 1]
    if (last?.kind === 'defs') return last.defs
    const defs: Def[] = []
    items.push({ kind: 'defs', defs })
    return defs
  }

  const closeLabel = () => {
    if (pendingLabel) {
      items.push({ kind: 'label', text: pendingLabel })
      pendingLabel = null
    }
  }

  for (const raw of blocks) {
    const b = raw as {
      _type?: string
      style?: string
      listItem?: string
      children?: { text?: string; marks?: string[] }[]
    }

    /* tabella di contenuto: header con filo, righe hairline */
    if (b._type === 'contentTable') {
      const tb = raw as {
        caption?: string
        columns?: string[]
        rows?: { cells?: string[] }[]
      }
      cell = null
      closeLabel()
      items.push({
        kind: 'table',
        caption: tb.caption,
        columns: tb.columns ?? [],
        rows: (tb.rows ?? []).map((r) => r.cells ?? []),
      })
      continue
    }

    /* griglia indice: le card "di cosa hai bisogno?" che portano
       alle ancore delle sezioni sotto */
    if (b._type === 'indexGrid') {
      const ig = raw as {
        items?: {
          label?: string
          title?: string
          text?: string
          anchor?: string
        }[]
      }
      cell = null
      closeLabel()
      items.push({
        kind: 'index',
        cards: (ig.items ?? [])
          .filter((c) => c.title && c.anchor)
          .map((c) => ({
            label: c.label,
            title: c.title as string,
            text: c.text,
            anchor: c.anchor as string,
          })),
      })
      continue
    }

    /* fila di chip (sedi, nomi): pill hairline in riga */
    if (b._type === 'chipList') {
      const cl = raw as { label?: string; items?: string[] }
      cell = null
      closeLabel()
      items.push({ kind: 'chips', label: cl.label, items: cl.items ?? [] })
      continue
    }

    /* griglia indice: card ancorate alle sezioni della pagina (le
       pagine organizzate per bisogni aprono così) */
    if (b._type === 'indexGrid') {
      const ig = raw as {
        items?: { label?: string; title?: string; text?: string; anchor?: string }[]
      }
      const cards = (ig.items ?? [])
        .filter((c) => c.title && c.anchor)
        .map((c) => ({
          label: c.label,
          title: c.title as string,
          text: c.text,
          anchor: c.anchor as string,
        }))
      if (cards.length > 0) {
        cell = null
        closeLabel()
        items.push({ kind: 'index', cards })
      }
      continue
    }

    if (b._type !== 'block') return null
    const spans = b.children ?? []
    const text = spans.map((c) => c.text ?? '').join('').trim()
    if (!text) continue

    if (b.listItem) {
      /* riga elenco: col primo span in grassetto diventa etichetta—testo */
      const first = spans[0]
      const strongLead =
        spans.length > 1 && (first?.marks ?? []).includes('strong')
      const def: Def = strongLead
        ? {
            label: (first?.text ?? '').trim(),
            text: spans.slice(1).map((c) => c.text ?? '').join('')
              .replace(/^\s*—\s*/, '').trim(),
          }
        : { text }
      if (cell) {
        cell.defs.push(def)
      } else {
        if (pendingLabel) {
          items.push({ kind: 'label', text: pendingLabel })
          pendingLabel = null
          items.push({ kind: 'defs', defs: [def] })
        } else {
          lastDefs().push(def)
        }
      }
      continue
    }

    if (b.style === 'h4') {
      cell = null
      if (pendingLabel) items.push({ kind: 'label', text: pendingLabel })
      pendingLabel = text
      continue
    }

    if (b.style === 'h3') {
      if (pendingLabel) {
        items.push({ kind: 'label', text: pendingLabel })
        pendingLabel = null
      }
      cell = { title: text, text: '', defs: [] }
      const last = items[items.length - 1]
      if (last?.kind === 'cells') last.cells.push(cell)
      else items.push({ kind: 'cells', cells: [cell] })
      continue
    }

    /* paragrafo */
    if (pendingLabel) {
      /* h4 + paragrafo = riga etichetta—testo (es. programma, orari) */
      lastDefs().push({ label: pendingLabel, text })
      pendingLabel = null
    } else if (cell && cell.defs.length === 0) {
      cell.text = cell.text ? `${cell.text}\n${text}` : text
    } else {
      cell = null
      items.push({ kind: 'p', text })
    }
  }
  if (pendingLabel) items.push({ kind: 'label', text: pendingLabel })

  /* solo paragrafi = testo libero: non serve dare forma */
  if (items.every((it) => it.kind === 'p')) return null
  return items
}

/* la sezione è fatta SOLO di card semplici (niente etichette né righe
   elenco): se tutte domande o tutte numerate prende la forma speciale */
function plainPairs(items: ShapeItem[]) {
  const lead: string[] = []
  const pairs: { title: string; text: string }[] = []
  for (const it of items) {
    if (it.kind === 'p' && pairs.length === 0) lead.push(it.text)
    else if (it.kind === 'cells' && it.cells.every((c) => c.text && c.defs.length === 0))
      pairs.push(...it.cells.map((c) => ({ title: c.title, text: c.text })))
    else return null
  }
  return pairs.length >= 2 ? { lead, pairs } : null
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
    /* obbligo normativo FSE+ (formazione finanziata): loghi + dicitura */
    funding?: { logos: string[]; logosAlt?: string; text: string }
    /* seconda voce dell'occhiello: "academy · servizi studenti" */
    eyebrow?: string
    /* azioni in testata, quando il mockup del topic le prevede */
    heroCtas?: { label: string; href: string }[]
    /* cella di recap in coda alla griglia corsi: riempie le colonne
       che avanzano nell'ultima riga (vedi .fillCta) */
    coursesCta?: { text: string; label: string; href: string }
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

  /* l'ultima sezione del corpo lungo può portarsi la chiusura da sé
     (campo "Azioni" in Sanity): in quel caso la CTA generica di coda
     non si stampa, altrimenti sotto a "Prenota l'open day" tornerebbe
     un secondo "prenota" che dice un'altra cosa */
  const ownClosing =
    ((page?.sections ?? []).at(-1)?.ctas ?? []).some(
      (c) => l(c.label, locale) && c.href
    )

  /* apertura a solo titolo (corsi custom): video e punti scendono in
     fondo, i punti come card numerate — vedi `pointsLast` in topics.ts */
  const pointsTail = topic.pointsLast === true

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
      <main
        className={[
          styles.main,
          topic.loudGroupLabels ? styles.loudLabels : '',
          /* corpo in fascia nera (servizi studenti): la classe scopa
             gli override in fondo al modulo a QUESTA pagina */
          topic.darkBody ? styles.darkBody : '',
          /* apertura secca (corsi custom): la fascia nera arriva subito
             dopo la lede, serve il respiro in fondo alla testata */
          topic.pointsLast ? styles.tailOpen : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* ————— testata compatta ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal className={styles.back}>
            <ArrowLink href={localeHref(locale, topic.base)} reverse>
              {t.topics.backTo} {sezione.toLowerCase()}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
            {/* ogni segmento con l'iniziale maiuscola (28/10):
                "Academy · Servizi studenti" */}
            {[sezione, copy.eyebrow]
              .filter((s): s is string => Boolean(s))
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' · ')}
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
          {/* azioni della testata: il primo è un bottone, gli altri link
              con freccia — un'ancora resta tale, un percorso prende la
              lingua davanti */}
          {(copy.heroCtas?.length ?? 0) > 0 && (
            <Reveal className={styles.sezCta} delay={220}>
              {copy.heroCtas!.map((c, i) => {
                const href = c.href.startsWith('/')
                  ? localeHref(locale, c.href)
                  : c.href
                return i === 0 ? (
                  <Button key={c.href} href={href}>
                    {c.label}
                  </Button>
                ) : (
                  <ArrowLink key={c.href} href={href} dir="e">
                    {c.label}
                  </ArrowLink>
                )
              })}
            </Reveal>
          )}
        </header>

        {/* punti dei topic con corsi: nel colore di pagina, prima del
            blocco scuro video + fascia corsi */}
        {copy.points.length > 0 && !pointsInBand && !pointsTail && (
          <section className={`wrap ${styles.points}`}>{pointsList}</section>
        )}

        {/* ————— banda video full-bleed di sezione ————— */}
        {!pointsTail && topic.heroMedia !== false && (
          <Reveal className={styles.heroMedia} delay={120}>
            <BgVideo
              src={media.src}
              portrait={media.portrait}
              poster={media.poster}
              className={styles.heroVideo}
            />
          </Reveal>
        )}

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
                /* stesse card a foto piena della landing universitari
                   (layout B): modulo condiviso, stessa UI e stesso hover
                   — foto che scala, pill categoria+tipologia, "entra nel
                   corso" con la freccia */
                <RevealGroup className={uni.grid}>
                  {elenco.map((course, i) => {
                    const ty = course.types?.[0] as
                      | keyof typeof t.academy.types
                      | undefined
                    const catLabel = l(course.category?.title, locale)
                    const meta = [
                      l(course.duration, locale),
                      l(course.mode, locale),
                    ].filter(Boolean) as string[]
                    return (
                      <Link
                        key={course._id}
                        /* i finanziati senza scheda vanno alla pagina di
                           categoria, mai su un 404 (lib/courses) */
                        href={courseHref(course, locale)}
                        className={`${uni.card} rv`}
                        style={{ '--rvd': `${(i % 3) * 60}ms` } as CSSProperties}
                      >
                        <figure className={uni.ph}>
                          <Thumb
                            image={course.coverImage}
                            index={i}
                            fill
                            alt={l(course.title, locale) ?? ''}
                          />
                        </figure>
                        <div className={uni.cardTop}>
                          {catLabel && (
                            <span className={uni.area}>{catLabel}</span>
                          )}
                          {ty && (
                            <span className={uni.tag}>
                              {t.academy.types[ty] ?? ty}
                            </span>
                          )}
                        </div>
                        <h3 className={uni.cardTitle}>
                          {l(course.title, locale)}
                        </h3>
                        {l(course.summary, locale) && (
                          <p className={uni.cardDesc}>
                            {l(course.summary, locale)}
                          </p>
                        )}
                        {meta.length > 0 && (
                          <div className={uni.cardMeta}>
                            {meta.map((m, k) =>
                              k === 0 ? <b key={m}>{m}</b> : <span key={m}>{m}</span>
                            )}
                          </div>
                        )}
                        {/* freccia della card: SVG, mai unicode */}
                        <span className={uni.go}>
                          <span className={uni.goLabel}>{t.uni.goCta}</span>
                          <svg
                            viewBox="0 0 24 24"
                            width="15"
                            height="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path d="M7 17 17 7M9 7h8v8" />
                          </svg>
                        </span>
                      </Link>
                    )
                  })}
                  {/* griglia modulare: se l'ultima riga resta incompleta
                      lo spazio avanzato ospita il recap con il rimando a
                      tutti i corsi — larga quante colonne mancano */}
                  {copy.coursesCta && elenco.length % 3 !== 0 && (
                    <div
                      className={`rv ${uni.fillCta}`}
                      style={
                        {
                          '--fill-span': 3 - (elenco.length % 3),
                          '--rvd': `${(elenco.length % 3) * 60}ms`,
                        } as CSSProperties
                      }
                    >
                      <p className={uni.fillCtaText}>{copy.coursesCta.text}</p>
                      <Button
                        variant="azzurro"
                        href={localeHref(locale, copy.coursesCta.href)}
                      >
                        {copy.coursesCta.label}
                      </Button>
                    </div>
                  )}
                </RevealGroup>
              )}
            </div>
          </section>
        )}

        {/* ————— corpo lungo, se il cliente lo scrive in Sanity: le FAQ
            diventano accordion, i processi numerati tabella come nelle
            pagine corso, il resto resta portable text ————— */}
        {sections.map((section, i) => {
          const body = l(section.body, locale)
          const brief = l(section.brief, locale)
          const shaped = shapeBody(body)
          /* rimandi in coda alla sezione (campo "Azioni" in Sanity):
             una voce senza etichetta o senza destinazione non si pubblica */
          const ctas = (section.ctas ?? [])
            .map((c) => ({ label: l(c.label, locale), href: c.href }))
            .filter((c): c is { label: string; href: string } =>
              Boolean(c.label && c.href)
            )
          const pp = shaped ? plainPairs(shaped) : null
          const isFaq =
            (pp?.pairs.every((p) => p.title.trim().endsWith('?')) ?? false)
          const isSteps =
            (pp?.pairs.every((p) => /^\d+[.)]\s/.test(p.title)) ?? false)
          /* corpo a fasce (flag `darkBody` in topics.ts): la PRIMA
             sezione resta la fascia scura, da 02 in poi tutto passa su
             banda BIANCA (richiesta 28/10) — gli "in breve" restano le
             card scure (colori fissi, non tokenizzati) */
          const inBand = topic.darkBody === true && i === 0
          const inWhite = topic.darkBody === true && i > 0
          const blocco = (
            <>
              {/* l'occhiello della sezione sta SOLO sul filetto numerato:
                  ripeterlo anche in testata lo stampava due volte di fila.
                  Sul corpo scuro la PRIMA sezione non porta il filetto:
                  il suo titolo grande apre la fascia da solo */}
              {!(topic.darkBody && i === 0) && (
                <Rule
                  left={String(i + 1).padStart(2, '0')}
                  right={l(section.kicker, locale)}
                />
              )}
              {/* l'ancora della sezione, quando c'è, è il bersaglio
                  delle card della griglia indice */}
              <section className={styles.sez} id={section.anchor || undefined}>
                <div className={`wrap ${styles.editorial}`}>
                  <SectionHeader title={l(section.title, locale)} />
                  <div>
                  {/* "in breve": riassunto in due righe, box scuro compatto */}
                  {brief && (
                    <div className={styles.brief}>
                      <span className={`mono ${styles.briefLabel}`}>
                        {t.topics.inBrief}
                      </span>
                      <p className={styles.briefText}>{brief}</p>
                    </div>
                  )}
                  {pp && (isFaq || isSteps) ? (
                    <div>
                      {pp.lead.map((p) => (
                        <p key={p} className={styles.sezLead}>
                          {p}
                        </p>
                      ))}
                      {isFaq ? (
                        <PointsAccordion items={pp.pairs} />
                      ) : (
                        <div className={styles.steps}>
                          {pp.pairs.map((p, j) => (
                            <div key={p.title} className={styles.step}>
                              <span className={`mono ${styles.stepNum}`}>
                                {String(j + 1).padStart(2, '0')}
                              </span>
                              <h3 className={styles.stepTitle}>
                                {p.title.replace(/^\d+[.)]\s*/, '')}
                              </h3>
                              <p className={styles.stepText}>{p.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : shaped ? (
                    <div>
                      {shaped.map((it, j) => {
                        if (it.kind === 'p')
                          return (
                            <p
                              key={j}
                              className={j === 0 ? styles.sezLead : styles.sezP}
                            >
                              {it.text}
                            </p>
                          )
                        if (it.kind === 'label')
                          return (
                            <span key={j} className={`mono ${styles.groupLabel}`}>
                              {it.text}
                            </span>
                          )
                        if (it.kind === 'table')
                          return (
                            <div key={j}>
                              {it.caption && (
                                <span className={`mono ${styles.groupLabel}`}>
                                  {it.caption}
                                </span>
                              )}
                              <div className={`scroller ${styles.tableWrap}`}>
                                <table className={styles.table}>
                                  <thead>
                                    <tr>
                                      {it.columns.map((c) => (
                                        <th key={c} scope="col">
                                          {c}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {it.rows.map((r, k) => (
                                      <tr key={k}>
                                        {r.map((c, x) =>
                                          x === 0 ? (
                                            <th key={x} scope="row">
                                              {c}
                                            </th>
                                          ) : (
                                            <td key={x}>{c}</td>
                                          )
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        if (it.kind === 'index')
                          return (
                            <div key={j} className={styles.indexGrid}>
                              {it.cards.map((c) => (
                                <a
                                  key={c.anchor}
                                  className={styles.indexCard}
                                  href={`#${c.anchor}`}
                                >
                                  {c.label && (
                                    <span className={`mono ${styles.indexNum}`}>
                                      {/* in Sanity le label arrivano col
                                          prefisso di pagina ("ss.01"): sul
                                          corpo scuro resta solo il numero */}
                                      {topic.darkBody
                                        ? c.label.replace(/^ss\.\s*/i, '')
                                        : c.label}
                                    </span>
                                  )}
                                  <span className={styles.indexTitle}>
                                    {c.title}
                                  </span>
                                  {c.text && (
                                    <span className={styles.indexText}>
                                      {c.text}
                                    </span>
                                  )}
                                </a>
                              ))}
                            </div>
                          )
                        if (it.kind === 'chips')
                          return (
                            <div key={j}>
                              {it.label && (
                                <span className={`mono ${styles.groupLabel}`}>
                                  {it.label}
                                </span>
                              )}
                              <div className={styles.chips}>
                                {it.items.map((c) => (
                                  <span key={c} className={styles.chip}>
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        /* griglia indice: una card per bisogno, ognuna
                           scende alla sua sezione (freccia SVG, mai
                           carattere unicode) */
                        if (it.kind === 'defs')
                          return (
                            <div key={j} className={styles.defs}>
                              {it.defs.map((d, k) => (
                                <div key={k} className={styles.def}>
                                  {d.label && (
                                    <span className={styles.defLabel}>
                                      {d.label}
                                    </span>
                                  )}
                                  <span
                                    className={
                                      d.label ? styles.defText : styles.defWide
                                    }
                                  >
                                    {d.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )
                        return (
                          <div key={j} className={styles.cells}>
                            {it.cells.map((c) => (
                              <div key={c.title} className={styles.cell}>
                                <h3 className={styles.cellTitle}>{c.title}</h3>
                                {c.text && (
                                  <p className={styles.cellText}>{c.text}</p>
                                )}
                                {c.defs.length > 0 && (
                                  <div className={styles.cellDefs}>
                                    {c.defs.map((d, k) => (
                                      <div key={k} className={styles.def}>
                                        {d.label && (
                                          <span className={styles.defLabel}>
                                            {d.label}
                                          </span>
                                        )}
                                        <span
                                          className={
                                            d.label
                                              ? styles.defText
                                              : styles.defWide
                                          }
                                        >
                                          {d.text}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <PortableBlocks value={body} />
                  )}
                  {/* azioni della sezione: il primo rimando è un bottone,
                      gli altri link con la freccia del brand */}
                  {ctas.length > 0 && (
                    <Reveal className={styles.sezCta}>
                      {ctas.map((c, k) => {
                        /* percorso interno = prefisso di lingua; il resto
                           è un indirizzo esterno e si apre a parte */
                        const internal = c.href.startsWith('/')
                        const href = internal
                          ? localeHref(locale, c.href)
                          : c.href
                        return k === 0 ? (
                          <Button
                            key={c.href}
                            href={href}
                            external={!internal}
                          >
                            {c.label}
                          </Button>
                        ) : (
                          <ArrowLink
                            key={c.href}
                            href={href}
                            external={!internal}
                            dir="e"
                          >
                            {c.label}
                          </ArrowLink>
                        )
                      })}
                    </Reveal>
                  )}
                  </div>
                </div>
              </section>
            </>
          )
          return (
            <Fragment key={section._key}>
              {inBand ? (
                <div className={`scheme-dark ${styles.sezBand}`}>{blocco}</div>
              ) : inWhite ? (
                <div className={styles.sezWhite}>{blocco}</div>
              ) : (
                blocco
              )}
            </Fragment>
          )
        })}

        {/* ————— coda delle pagine ad apertura secca: PRIMA la tabella
            dei punti, poi la banda video (ordine invertito su richiesta
            cliente, ott 2026) ————— */}
        {pointsTail && (
          <>
            {copy.points.length > 0 && (
              <section className={`wrap ${styles.points}`}>
                <RevealGroup className={styles.pointCards}>
                  {copy.points.map((p, i) => {
                    /* le card reggono entrambe le forme del dizionario:
                       stringa secca o titolo + corpo esteso */
                    const title = typeof p === 'string' ? p : p.title
                    const text = typeof p === 'string' ? undefined : p.text
                    return (
                      <div key={title} className={`rv ${styles.pointCard}`}>
                        <span className={`mono ${styles.pointCardNum}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className={styles.pointCardText}>{title}</p>
                        {text && (
                          <p className={styles.pointCardBody}>{text}</p>
                        )}
                      </div>
                    )
                  })}
                </RevealGroup>
              </section>
            )}
            {/* la CTA di coda sta PRIMA del video, su fascia nera
                (richiesta 28/10) */}
            {!ownClosing && (
              <section className={`scheme-dark ${styles.ctaBand}`}>
                <div className={`wrap ${styles.cta}`}>
                  <Reveal>
                    <Button href={shopHref(settings)} external variant="azzurro">
                      {t.nav.book}
                    </Button>
                  </Reveal>
                  <Reveal delay={80}>
                    <ArrowLink href={localeHref(locale, topic.base)} dir="e">
                      {t.nav.explore}
                    </ArrowLink>
                  </Reveal>
                </div>
              </section>
            )}
            <Reveal className={`${styles.heroMedia} ${styles.heroMediaTight}`}>
              <BgVideo
                src={media.src}
                portrait={media.portrait}
                poster={media.poster}
                className={styles.heroVideo}
              />
            </Reveal>
          </>
        )}

        {/* ————— fascia FSE+ (obbligo normativo), se il topic la porta ————— */}
        {copy.funding && (
          <FundingBand
            logos={copy.funding.logos}
            logosAlt={copy.funding.logosAlt}
            text={copy.funding.text}
          />
        )}

        {/* ————— chiusura: sui corsi finanziati il form "Avvisami" (le
            iscrizioni aprono a bando), altrove la CTA generica ————— */}
        {topic.slug === 'formazione-finanziata' ? (
          <section className={`scheme-dark ${styles.band}`} style={bandVars}>
            <div className="wrap">
              <AvvisamiForm
                labels={t.avvisami}
                privacyHref={localeHref(locale, '/privacy')}
              />
            </div>
          </section>
        ) : ownClosing || pointsTail ? null : (
          <section className={`wrap ${styles.cta}`}>
            <Reveal>
              <Button href={shopHref(settings)} external variant="azzurro">
                {t.nav.book}
              </Button>
            </Reveal>
            <Reveal delay={80}>
              <ArrowLink href={localeHref(locale, topic.base)} dir="e">
                {t.nav.explore}
              </ArrowLink>
            </Reveal>
          </section>
        )}
      </main>
    </SiteChrome>
  )
}
