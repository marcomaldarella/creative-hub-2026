/**
 * Allinea ai mockup v2 le due pagine topic dell'Academy:
 *
 * servizi-studenti
 *  - "Pagare meno.": la tabella delle borse torna dove sta nel mockup,
 *    subito dopo la riga sul merito e PRIMA di "Come si assegnano"
 *  - "International students.": etichetta "in English" davanti al
 *    paragrafo in inglese (nel mockup è un blocco a sé, con lang="en")
 *  - "Un referente per ogni domanda.": in coda il rimando all'open day
 *
 * stage-placement
 *  - "Dove fanno stage e progetti.": in coda "Scopri Erasmus+", che nel
 *    mockup è il bottone della riga bianca sull'estero
 *  - "Conosci chi l'ha fatto.": i due rimandi di chiusura del mockup
 *    (open day + corsi universitari)
 *
 * Uso: node scripts/patch-academy-topic-ctas.mjs
 * Idempotente: _key fissi e confronto col valore atteso prima di scrivere.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@sanity/client'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = {}
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: env.SANITY_API_TOKEN,
  apiVersion: '2026-07-01',
  useCdn: false,
})

/* testo piatto di un blocco, per riconoscerlo senza dipendere dall'ordine */
const flat = (b) =>
  (b.children ?? []).map((c) => c.text ?? '').join('').trim()

/* le azioni di una sezione: _key fisso = rilanciare non duplica */
const cta = (key, it, en, href) => ({
  _key: key,
  _type: 'pageSectionCta',
  label: { _type: 'localeString', it, en },
  href,
})

const CTAS = {
  'servizi-studenti': {
    /* sezione riconosciuta dal kicker/titolo, non dal _key */
    contatti: [
      cta('cta-open-day', "Prenota l'open day", 'Book the open day',
        '/academy/open-day'),
    ],
  },
  'stage-placement': {
    rete: [
      cta('cta-erasmus', 'Scopri Erasmus+', 'Discover Erasmus+',
        '/academy/servizi-studenti#estero'),
    ],
    chiusura: [
      cta('cta-open-day', "Prenota l'open day", 'Book the open day',
        '/academy/open-day'),
      cta('cta-uni', 'Vedi i corsi universitari',
        'See the university courses', '/academy/corsi-universitari'),
    ],
  },
}

/* confronto stabile: Sanity rimanda i campi in ordine alfabetico, quindi
   si guardano i valori e non la forma dell'oggetto */
const norm = (list = []) =>
  list
    .map((c) => [c._key, c.label?.it ?? '', c.label?.en ?? '', c.href ?? ''].join('|'))
    .join('§')
const sameCtas = (a, b) => norm(a) === norm(b)

/* i sotto-titoli del mockup (p.sub): paragrafi piani in Sanity, qui
   diventano etichette di gruppo (h4) come le legge il TopicScreen */
const SUBHEADS = new Set([
  'Come si assegnano',
  'Early Bird, entro il 31 marzo',
  'Rate a tasso zero',
  'Per risparmiare ogni giorno',
  'Chi può partire',
  'Requisiti di inglese',
  'Studiare anche a distanza',
  'E fuori dalle lezioni',
])

async function patchPage(pageId, plan) {
  const doc = await client.fetch(
    '*[_type == "page" && pageId == $pageId][0]{_id, sections}',
    { pageId }
  )
  if (!doc) {
    console.log(`${pageId}: documento assente, salto`)
    return
  }
  const sections = structuredClone(doc.sections ?? [])
  const changes = []

  for (const [i, s] of sections.entries()) {
    const title = s.title?.it ?? ''
    const anchor = s.anchor ?? ''
    const kicker = s.kicker?.it ?? ''
    const body = Array.isArray(s.body?.it) ? s.body.it : null

    /* ————— servizi-studenti · i sotto-titoli diventano etichette ————— */
    if (pageId === 'servizi-studenti' && body) {
      for (const b of body) {
        if (
          b._type === 'block' &&
          !b.listItem &&
          b.style !== 'h4' &&
          SUBHEADS.has(flat(b))
        ) {
          b.style = 'h4'
          changes.push(`${pageId}/${anchor || title}: "${flat(b)}" a etichetta`)
        }
      }
    }

    /* ————— servizi-studenti · borse: tabella prima di "Come si assegnano" ————— */
    if (pageId === 'servizi-studenti' && anchor === 'soldi' && body) {
      const t = body.findIndex((b) => b._type === 'contentTable')
      /* la tabella va dopo l'ultimo paragrafo di apertura, cioè prima
         della prima etichetta di gruppo (h4) */
      const firstH4 = body.findIndex(
        (b) => b._type === 'block' && b.style === 'h4'
      )
      /* già a posto quando la tabella precede di uno la prima etichetta */
      if (t > -1 && firstH4 > -1 && t !== firstH4 - 1) {
        const [table] = body.splice(t, 1)
        const at = body.findIndex(
          (b) => b._type === 'block' && b.style === 'h4'
        )
        body.splice(at, 0, table)
        changes.push(`${pageId}/soldi: tabella borse spostata in apertura`)
      }
    }

    /* ————— servizi-studenti · international: etichetta "in English" ————— */
    if (pageId === 'servizi-studenti' && anchor === 'international' && body) {
      const hasLabel = body.some(
        (b) => b._type === 'block' && b.style === 'h4' && flat(b) === 'in English'
      )
      const en = body.findIndex(
        (b) =>
          b._type === 'block' &&
          /^Our International Support Team/.test(flat(b))
      )
      if (!hasLabel && en > -1) {
        body.splice(en, 0, {
          _key: 'ss-en-label',
          _type: 'block',
          style: 'h4',
          markDefs: [],
          children: [
            { _key: 'ss-en-label-s', _type: 'span', marks: [], text: 'in English' },
          ],
        })
        changes.push(`${pageId}/international: etichetta "in English" aggiunta`)
      }
    }

    /* ————— stage-placement · ancora per "Leggi le storie" ————— */
    if (
      pageId === 'stage-placement' &&
      kicker === 'storie di mestiere' &&
      s.anchor !== 'storie'
    ) {
      sections[i] = { ...s, anchor: 'storie' }
      changes.push(`${pageId}/"${title}": ancora #storie`)
    }

    /* ————— azioni di chiusura ————— */
    let want = null
    if (pageId === 'servizi-studenti' && kicker === 'contatti')
      want = plan.contatti
    if (pageId === 'stage-placement' && kicker === 'la rete') want = plan.rete
    if (pageId === 'stage-placement' && kicker === 'open day')
      want = plan.chiusura
    if (want && !sameCtas(s.ctas, want)) {
      /* si parte da sections[i], non da s: altrimenti si perderebbe
         un'eventuale modifica fatta qui sopra sulla stessa sezione */
      sections[i] = { ...sections[i], ctas: want }
      changes.push(`${pageId}/"${title}": ${want.length} azione/i`)
    }
  }

  if (changes.length === 0) {
    console.log(`${pageId}: già allineato`)
    return
  }
  await client.patch(doc._id).set({ sections }).commit()
  for (const c of changes) console.log(`  ✓ ${c}`)
}

for (const [pageId, plan] of Object.entries(CTAS)) {
  await patchPage(pageId, plan)
}
