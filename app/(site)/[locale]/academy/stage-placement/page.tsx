import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Fragment, type CSSProperties } from 'react'
import {
  ArrowLink,
  Button,
  Counter,
  CounterRow,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import { BgVideo } from '@/components/sections/BgVideo'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { UniSubnav } from '@/components/sections/UniSubnav'
import { isLocale, localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { l } from '@/lib/sanity/l'
import { getPageById } from '@/lib/sanity/queries'
import type { PageSection } from '@/lib/sanity/types'
import { pageAlternates, topicBreadcrumbJsonLd } from '@/lib/seo'
import { findTopic } from '@/lib/topics'
import det from '@/components/sections/DetailPage.module.css'
import tp from '@/components/sections/TopicScreen.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* ————————————————————————————————————————————————————————————————
   /academy/stage-placement — la pagina delle prove.

   Route dedicata: vince sulla route [slug] (che resta per gli altri
   topic). Ricostruita sulla struttura del mockup v2 del cliente
   (Downloads/pagine-html/academy/stage-placement.html).

   IL RESPIRO DELLA PAGINA — rivisto a ott 2026: l'alternanza del
   mockup non c'è più. Resta azzurra SOLO la testata (coi numeri);
   dall'indice sticky in giù tutto vive su un'unica fascia nera:

     testata          azzurro   (.st-hero, colata di SiteChrome)
     01 il percorso   NERO      con le carte scure a filo chiaro
     02 le storie     NERO      a tutta larghezza
     03 label lab     NERO      (.band)
     04 la rete       NERO      con la carta scura Erasmus+ (.abroad)
     05 domande       NERO
     open day         NERO      (.prenota) — l'unica azione in fondo

   L'azzurro della testata arriva da SiteChrome (colata di sezione su
   /academy/*): non si dipinge qui. La fascia nera è `.scheme-dark`
   del sito, col nero del sito — NON il #0A0E14 del mockup; i ritocchi
   dove i token invertiti non bastano stanno nel modulo locale
   (darkBand). Il giallo #FFE24A del mockup resta fuori: è il colore
   dei promemoria redazionali.

   I contenuti NON sono scritti qui: arrivano dal documento Sanity
   `page` con pageId `stage-placement`, già allineato al mockup e già
   bonificato dai gialli (le due domande senza risposta del Career
   Service, il dubbio sullo stage obbligatorio, la nota sul consenso
   delle storie). La pagina riconosce ogni sezione dalla sua ancora
   (scripts/patch-stage-placement-anchors.mjs) e le dà la forma del
   mockup. Dal dizionario arrivano testata, numeri e indice sticky.
   ———————————————————————————————————————————————————————————————— */

const TOPIC = findTopic('/academy', 'stage-placement')

/* le voci dell'indice sticky, nell'ordine: la chiusura open day non è
   una sezione da leggere, è l'azione */
const INDEX_ANCHORS = [
  'percorso',
  'storie',
  'label-lab',
  'rete',
  'domande',
] as const

/* ————— dal portable text alla forma del mockup ————— */

type Blk = {
  _type?: string
  style?: string
  listItem?: string
  children?: { text?: string; marks?: string[] }[]
}

/** nodi utili: paragrafo, testatina (h3/h4), riga elenco, fila di chip */
type Node =
  | { k: 'p'; text: string }
  | { k: 'head'; text: string }
  | { k: 'row'; label?: string; text: string }
  | { k: 'chips'; label?: string; items: string[] }

const textOf = (b: Blk) =>
  (b.children ?? [])
    .map((c) => c.text ?? '')
    .join('')
    .trim()

/**
 * Legge il corpo di una sezione e lo riduce a nodi. Le righe elenco
 * scritte come «**Etichetta** — testo» (la convenzione già usata in
 * Sanity su questa pagina) tornano separate in label + text.
 */
function nodesOf(blocks?: unknown[] | null): Node[] {
  const out: Node[] = []
  for (const raw of blocks ?? []) {
    const b = raw as Blk

    if (b._type === 'chipList') {
      const cl = raw as { label?: string; items?: string[] }
      out.push({ k: 'chips', label: cl.label, items: cl.items ?? [] })
      continue
    }
    if (b._type !== 'block') continue

    const spans = b.children ?? []
    const text = textOf(b)
    if (!text) continue

    if (b.listItem) {
      const first = spans[0]
      const hasLabel =
        spans.length > 1 && (first?.marks ?? []).includes('strong')
      out.push(
        hasLabel
          ? {
              k: 'row',
              label: (first?.text ?? '').trim(),
              text: spans
                .slice(1)
                .map((c) => c.text ?? '')
                .join('')
                .replace(/^\s*—\s*/, '')
                .trim(),
            }
          : { k: 'row', text }
      )
      continue
    }
    if (b.style === 'h3' || b.style === 'h4') {
      out.push({ k: 'head', text })
      continue
    }
    out.push({ k: 'p', text })
  }
  return out
}

/** paragrafi prima della prima testatina: il cappello della sezione */
function leadOf(nodes: Node[]) {
  const out: string[] = []
  for (const n of nodes) {
    if (n.k !== 'p') break
    out.push(n.text)
  }
  return out
}

/** testatina + righe elenco che la seguono: i gruppi del percorso e della rete */
function groupsOf(nodes: Node[]) {
  const groups: { label: string; rows: { label?: string; text: string }[] }[] =
    []
  for (const n of nodes) {
    if (n.k === 'head') groups.push({ label: n.text, rows: [] })
    else if (n.k === 'row' && groups.length > 0)
      groups[groups.length - 1].rows.push({ label: n.label, text: n.text })
  }
  return groups.filter((g) => g.rows.length > 0)
}

/** testatina + paragrafo che la segue: le storie e le domande */
function pairsOf(nodes: Node[]) {
  const pairs: { title: string; text: string }[] = []
  for (const n of nodes) {
    if (n.k === 'head') pairs.push({ title: n.text, text: '' })
    else if (n.k === 'p' && pairs.length > 0) {
      const last = pairs[pairs.length - 1]
      last.text = last.text ? `${last.text}\n${n.text}` : n.text
    }
  }
  /* una voce senza risposta non si pubblica: nel mockup le due domande
     ancora da confermare col Career Service sono proprio quelle vuote */
  return pairs.filter((p) => p.title && p.text)
}

/** righe elenco senza testatina sopra: i tre passi del Label Lab */
const rowsOf = (nodes: Node[]) =>
  nodes.filter((n): n is Extract<Node, { k: 'row' }> => n.k === 'row')

/** paragrafi in coda, dopo gruppi e righe: la nota Erasmus+ della rete */
function tailOf(nodes: Node[]) {
  const lead = leadOf(nodes).length
  return nodes
    .slice(lead)
    .filter((n): n is Extract<Node, { k: 'p' }> => n.k === 'p')
    .map((n) => n.text)
}

const chipsOf = (nodes: Node[]) =>
  nodes.filter((n): n is Extract<Node, { k: 'chips' }> => n.k === 'chips')

/* rimandi di una sezione Sanity: il primo è un bottone, gli altri link */
function ctasOf(section: PageSection | undefined, locale: Locale) {
  return (section?.ctas ?? [])
    .map((c) => ({ label: l(c.label, locale), href: c.href }))
    .filter((c): c is { label: string; href: string } =>
      Boolean(c.label && c.href)
    )
}

const hrefOf = (locale: Locale, href: string) =>
  href.startsWith('/') ? localeHref(locale, href) : href

/** ritardo a scaletta dentro un RevealGroup (lo legge il modulo CSS) */
const rvd = (ms: number) => ({ '--rvd': `${ms}ms` }) as CSSProperties

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).topics.stagePlacement
  return {
    /* dicitura esatta della nota dello sviluppatore, nei dizionari */
    title: d.metaTitle,
    description: d.metaDesc,
    alternates: pageAlternates(locale, '/academy/stage-placement'),
  }
}

export default async function StagePlacementPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.topics.stagePlacement
  const page = await getPageById('stage-placement')
  const sections = page?.sections ?? []

  /* sezione per ancora, non per posizione: nello Studio si possono
     riordinare senza scomporre la pagina */
  const sez = (anchor: string) => sections.find((s) => s.anchor === anchor)
  const bodyOf = (anchor: string) => nodesOf(l(sez(anchor)?.body, locale))
  const titleOf = (anchor: string) => l(sez(anchor)?.title, locale) ?? ''
  const kickerOf = (anchor: string) => l(sez(anchor)?.kicker, locale) ?? ''

  const percorso = bodyOf('percorso')
  const storie = bodyOf('storie')
  const labelLab = bodyOf('label-lab')
  const rete = bodyOf('rete')
  const domande = bodyOf('domande')
  const openDay = bodyOf('open-day')

  const sezione = t.nav.academy

  /* l'anno accademico per la coda dell'indice: dalla striscia in cima
     al sito, senza una stringa nuova («iscrizioni aperte · A.A. 2026/27») */
  const year = t.nav.topbar.middle.split('·').pop()?.trim() ?? ''

  /* le voci dell'indice: solo quelle che hanno davvero una sezione */
  const indexItems = INDEX_ANCHORS.filter((a) => sez(a)).map((a) => ({
    id: a,
    label: d.subnav.items[a],
  }))

  const breadcrumb = TOPIC ? topicBreadcrumbJsonLd(locale, TOPIC) : null
  const openDayCtas = ctasOf(sez('open-day'), locale)
  const reteCtas = ctasOf(sez('rete'), locale)
  /* la nota in coda alla rete: «e all'estero, con Erasmus+…» */
  const reteTail = tailOf(rete)
  const persone = pairsOf(storie)
  const faq = pairsOf(domande)

  return (
    <SiteChrome locale={locale} path="/academy/stage-placement">
      {/* BreadcrumbList (nota dello sviluppatore): stessa funzione delle
          altre pagine di sezione, home → academy → stage & placement */}
      {breadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        />
      )}

      <main className={styles.main}>
        {/* ———————————————— testata · azzurro ———————————————— */}
        <header className={`wrap ${tp.head}`}>
          <Reveal className={tp.back}>
            <ArrowLink href={localeHref(locale, '/academy')} reverse>
              {t.topics.backTo} {sezione.toLowerCase()}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${tp.kicker}`} delay={60}>
            {[sezione.toLowerCase(), d.eyebrow].filter(Boolean).join(' · ')}
          </Reveal>
          {/* l'83% NON entra nell'h1 (nota dello sviluppatore): resta in
              grande nei numeri, con la fonte */}
          <Reveal as="h1" className={`display-thin ${tp.title}`} delay={120}>
            {d.title.split('\n').map((line) => (
              <span key={line} className={tp.titleLine}>
                {line}
              </span>
            ))}
          </Reveal>
          <Reveal as="p" className={tp.lede} delay={180}>
            {d.lede}
          </Reveal>
          <Reveal className={tp.sezCta} delay={220}>
            {/* due bottoni affiancati: le storie in pastiglia nera,
                l'open day come ghost accanto */}
            {d.heroCtas.map((c, i) =>
              i === 0 ? (
                <Button key={c.href} href={hrefOf(locale, c.href)}>
                  {c.label}
                </Button>
              ) : (
                <Button
                  key={c.href}
                  variant="ghost"
                  href={hrefOf(locale, c.href)}
                >
                  {c.label}
                </Button>
              )
            )}
          </Reveal>

          {/* ————— i numeri: 83% / 20 / 27 come contatori, cifra in
              grande, sotto la riga di testo e — per l'83% — la fonte.
              Il promemoria giallo del mockup «verificare base del dato»
              è una nota interna: non si pubblica.
              Entrano in coda alla scaletta della testata (back 0 →
              kicker 60 → titolo 120 → lede 180 → cta 220): ogni cella
              porta la sua `rv` e il gruppo le rivela, col ritardo a
              scaletta via --rvd come nelle sezioni qui sotto. ————— */}
          <RevealGroup>
            <CounterRow className={styles.stats}>
              {d.stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`rv ${styles.stat}`}
                  style={rvd(280 + i * 80)}
                >
                  <Counter
                    value={s.value}
                    suffix={s.suffix}
                    label={s.label}
                    formatLocale={locale === 'en' ? 'en-GB' : 'it-IT'}
                    className={styles.counter}
                  />
                  {s.source && (
                    <span className={styles.source}>{s.source}</span>
                  )}
                </div>
              ))}
            </CounterRow>
          </RevealGroup>
        </header>

        {/* ————— fascia nera: da qui in giù la pagina vive su nero —————
            l'hero coi numeri resta nell'azzurro del flood; il resto sta
            in un'unica fascia scheme-dark (stessa tecnica della darkBand
            dell'indice academy): i token invertiti portano testi e fili
            a chiaro, gli aggiusti stanno nel modulo locale */}
        <div className={`scheme-dark ${styles.darkBand}`}>
        {/* ————— indice sticky: la pagina è lunga e va letta per prove ————— */}
        {indexItems.length > 1 && (
          <UniSubnav
            tone="dark"
            course={d.eyebrow}
            year={year}
            items={indexItems}
            prevLabel={d.subnav.prev}
            nextLabel={d.subnav.next}
          />
        )}

        {/* ———————————————— 01 il percorso · azzurro,
            tre carte bianche anno per anno ———————————————— */}
        {percorso.length > 0 && (
          <>
            {/* niente filetto "01 — il percorso": la voce sta già nello
                scroller sticky qui sopra */}
            <section className={`wrap ${det.sez}`} id="percorso">
              <SectionHeader
                title={titleOf('percorso')}
                lede={leadOf(percorso).join(' ')}
              />
              <RevealGroup className={styles.journey}>
                {groupsOf(percorso).map((g, i) => (
                  <div
                    key={g.label}
                    className={`rv ${styles.stage}`}
                    style={rvd(i * 80)}
                  >
                    <span className={styles.when}>{g.label}</span>
                    <ul className={styles.stageList}>
                      {g.rows.map((r) => (
                        <li key={r.label ?? r.text} className={styles.stageRow}>
                          {r.label && (
                            <span className={styles.stageLabel}>{r.label}</span>
                          )}
                          <span className={styles.stageText}>{r.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </RevealGroup>
            </section>
          </>
        )}

        {/* ———————————————— 02 le storie · azzurro, A TUTTA LARGHEZZA
            Richiesta di Marco: titolo a sinistra, le storie in due
            colonne fino al gutter. ———————————————— */}
        {persone.length > 0 && (
          <>
            <Rule left="02" right={kickerOf('storie')} />
            <section className={`wrap ${det.sez}`} id="storie">
              <div className={styles.storie}>
                <div>
                  <Reveal
                    as="h2"
                    className={`display-thin ${det.h2} ${styles.storieTitle}`}
                  >
                    {titleOf('storie')}
                  </Reveal>
                  {leadOf(storie).map((p) => (
                    <Reveal
                      key={p}
                      as="p"
                      className={`${tp.sezP} ${styles.storieLede}`}
                      delay={80}
                    >
                      {p}
                    </Reveal>
                  ))}
                </div>
                <RevealGroup className={styles.people}>
                  {persone.map((p, i) => {
                    /* «Nome · risultato»: il risultato diventa la pastiglia */
                    const [name, ...rest] = p.title.split('·')
                    const now = rest.join('·').trim()
                    return (
                      <article
                        key={p.title}
                        className={`rv ${styles.person}`}
                        style={rvd((i % 2) * 80)}
                      >
                        {now && <span className={styles.now}>{now}</span>}
                        <h3 className={styles.personName}>{name.trim()}</h3>
                        <p className={styles.personText}>{p.text}</p>
                      </article>
                    )
                  })}
                </RevealGroup>
              </div>
            </section>
          </>
        )}

        {/* ———————————————— 03 label lab · FASCIA NERA
            chi ascolta le produzioni e come si esce ———————————————— */}
        {labelLab.length > 0 && (
          <>
            <Rule left="03" right={kickerOf('label-lab')} />
            <section className={`scheme-dark ${tp.band}`} id="label-lab">
              <div className={`wrap ${styles.ll}`}>
                <div>
                  <Reveal as="h2" className={`display-thin ${det.h2}`}>
                    {titleOf('label-lab')}
                  </Reveal>
                  {leadOf(labelLab).map((p) => (
                    <Reveal key={p} as="p" className={tp.sezP} delay={80}>
                      {p}
                    </Reveal>
                  ))}
                  {chipsOf(labelLab).map((c) => (
                    <Fragment key={c.label ?? 'chips'}>
                      {c.label && (
                        <span className={`mono ${tp.groupLabel}`}>
                          {c.label}
                        </span>
                      )}
                      <div className={tp.chips}>
                        {c.items.map((item) => (
                          <span
                            key={item}
                            className={`${tp.chip} ${styles.llChip}`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </Fragment>
                  ))}
                </div>
                {/* i tre passi: selezione, produzione, uscita. Nel mockup
                    sono una lista con la cifra guida a sinistra e titolo
                    e testo impilati, non una tabella a due colonne: la
                    colonna qui è mezza pagina. */}
                <RevealGroup className={styles.llSteps}>
                  {rowsOf(labelLab).map((r, i) => (
                    <div
                      key={r.label ?? r.text}
                      className={`rv ${styles.llStep}`}
                      style={rvd(i * 80)}
                    >
                      <span className={`mono ${styles.llNum}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className={styles.llTitle}>{r.label ?? ''}</h3>
                        <p className={styles.llText}>{r.text}</p>
                      </div>
                    </div>
                  ))}
                </RevealGroup>
              </div>
            </section>
          </>
        )}

        {/* ———————————————— 04 la rete · azzurro, con la carta
            bianca dell'Erasmus+ in coda ———————————————— */}
        {rete.length > 0 && (
          <>
            <Rule left="04" right={kickerOf('rete')} />
            <section className={`wrap ${det.sez}`} id="rete">
              <SectionHeader title={titleOf('rete')} />
              <RevealGroup className={styles.where}>
                {groupsOf(rete).map((g, i) => (
                  <div
                    key={g.label}
                    className={`rv ${styles.whereCol}`}
                    style={rvd(i * 60)}
                  >
                    <h3 className={`mono ${styles.whereLabel}`}>{g.label}</h3>
                    <ul className={styles.whereList}>
                      {g.rows.map((r) => (
                        <li
                          key={r.label ?? r.text}
                          className={styles.whereItem}
                        >
                          <span className={styles.whereName}>
                            {r.label ?? r.text}
                          </span>
                          {r.label && (
                            <span className={styles.whereNote}>{r.text}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </RevealGroup>
              {reteTail.length > 0 && (
                <Reveal className={styles.abroad}>
                  <div>
                    {reteTail.map((p) => (
                      <p key={p} className={styles.abroadText}>
                        {p}
                      </p>
                    ))}
                  </div>
                  {reteCtas.length > 0 && (
                    /* sul nero il tasto pieno è bianco, non petrolio
                       (che sparirebbe): override scheme-dark del variant */
                    <Button
                      variant="azzurro"
                      href={hrefOf(locale, reteCtas[0].href)}
                    >
                      {reteCtas[0].label}
                    </Button>
                  )}
                </Reveal>
              )}
            </section>
          </>
        )}

        {/* ———————————————— open day · PRIMA delle domande (ordine
            voluto dal cliente): videino a sinistra, testo a destra ———————— */}
        {sez('open-day') && (
          <div className={`scheme-dark ${det.dark}`} id="open-day">
            <section className={`wrap ${det.sez} ${styles.endGrid}`}>
              <Reveal className={styles.endMedia}>
                <BgVideo
                  src="/video/stage-open-day.mp4"
                  className={styles.endVideo}
                />
              </Reveal>
              <div>
                <Reveal as="span" className={`mono ${styles.endKicker}`}>
                  {kickerOf('open-day')}
                </Reveal>
                <Reveal
                  as="h2"
                  className={`display-thin ${det.ctaTitle}`}
                  delay={60}
                >
                  {titleOf('open-day')}
                </Reveal>
                {leadOf(openDay).map((p) => (
                  <Reveal key={p} as="p" className={det.ctaText} delay={120}>
                    {p}
                  </Reveal>
                ))}
                <Reveal className={det.ctaRow} delay={180}>
                  {openDayCtas.map((c, i) =>
                    i === 0 ? (
                      <Button
                        key={c.href}
                        variant="azzurro"
                        href={hrefOf(locale, c.href)}
                      >
                        {c.label}
                      </Button>
                    ) : (
                      <ArrowLink
                        key={c.href}
                        href={hrefOf(locale, c.href)}
                        dir="e"
                      >
                        {c.label}
                      </ArrowLink>
                    )
                  )}
                </Reveal>
              </div>
            </section>
          </div>
        )}

        {/* ———————————————— 05 domande · in chiusura
            solo quelle con una risposta vera: le due «da confermare
            con il Career Service» del mockup non si pubblicano ———————— */}
        {faq.length > 0 && (
          <>
            <Rule left="05" right={kickerOf('domande')} />
            <section className={`wrap ${det.sez} ${det.duo}`} id="domande">
              <Reveal as="h2" className={`display-thin ${det.h2}`}>
                {titleOf('domande')}
              </Reveal>
              {/* una sola domanda in chiusura (richiesta cliente) */}
              <PointsAccordion items={faq.slice(0, 1)} plain />
            </section>
          </>
        )}
        </div>
      </main>
    </SiteChrome>
  )
}
