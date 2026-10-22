/**
 * Porta il doc page `servizi-studenti` al mockup v2 (ott 2026):
 * - sezione iniziale "Di cosa hai bisogno?" con le 6 card ss.01–ss.06
 * - box "In breve" (campo brief) su ognuna delle 6 sezioni di servizio
 * - tabella delle borse di merito nella sezione "Pagare meno."
 * - Erasmus+: etichetta "Dove" con le 6 sedi a chip
 * - contatti: righe telefono / whatsapp / email (l'indirizzo della
 *   segreteria resta fuori: nel mockup è giallo "da confermare")
 * Uso: node scripts/patch-servizi-studenti-v2.mjs
 * Idempotente: _key fissi e set esplicito, rilanciarlo non cambia nulla.
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

/* ---------- block helpers (chiavi fisse = idempotenza) ---------- */

const block = (key, text, style = 'normal') => ({
  _key: key,
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _key: `${key}-s`, _type: 'span', marks: [], text }],
})

/* ---------- contenuti ---------- */

/* le 6 card della sezione d'apertura (titolo + sottotitolo dal mockup) */
const INTRO_CARDS = [
  ['Voglio pagare meno.', 'Borse di merito, Early Bird, rate a tasso zero'],
  ['Cerco casa a Bologna.', 'Residenze convenzionate e aiuto nella ricerca'],
  ["Voglio un'esperienza all'estero.", 'Tirocini Erasmus+ di 3 mesi, spese coperte'],
  ["Arrivo dall'estero.", 'Visto, lingua, alloggio · in English'],
  ['Voglio qualcuno che mi segua.', 'Un tutor dedicato, dal primo giorno'],
  ['Ho un DSA o una disabilità.', 'Percorsi personalizzati e spazi accessibili'],
]

const introSection = {
  _key: 'ss-intro',
  _type: 'pageSection',
  kicker: { it: 'di cosa hai bisogno?' },
  title: { it: 'Di cosa hai bisogno?' },
  body: {
    it: INTRO_CARDS.flatMap(([titolo, sotto], i) => [
      block(`ss-intro-h${i}`, titolo, 'h3'),
      block(`ss-intro-p${i}`, sotto),
    ]),
  },
}

/* "In breve" per ognuna delle sei sezioni, dal mockup (testi integrali) */
const BRIEFS = {
  'Pagare meno.':
    'Ci sono tre modi per ridurre il costo: le borse di studio di merito, lo sconto Early Bird se ti pre-iscrivi entro il 31 marzo, e le rate a tasso zero.',
  'Trovare casa a Bologna.':
    "Ti aiutiamo a trovare un alloggio vicino all'Academy, per pochi mesi o per tutto il percorso, anche nelle residenze convenzionate.",
  'Partire con Erasmus+.':
    "Tre mesi di tirocinio in un'azienda delle industrie creative in Europa. Volo, alloggio e una somma per le spese sono coperti.",
  'International students.':
    "L'International Support Team ti aiuta con visto, casa e primi passi in Italia. Ci sono corsi intensivi di inglese e di italiano.",
  'Avere qualcuno che ti segue.':
    "Dal primo colloquio all'ultimo esame hai un tutor di riferimento: per scegliere il corso, organizzare lo studio e muovere i primi passi nel lavoro.",
  'Studiare con un DSA o una disabilità.':
    "Costruiamo il percorso insieme a te: strumenti, tempi e modalità d'esame adatti, spazi accessibili. Scrivici prima di iscriverti.",
}

/* ⚠️ SUPERATO dall'audit mockup-vs-live di ott 2026: il badge giallo
   "a.a. 2026/27 da confermare" riguarda proprio quote e importi, quindi
   la tabella NON si pubblica finché l'Academy non conferma l'anno
   accademico. Resta qui pronta, ma non entra più nel documento — chi
   la rimette in pagina lo fa solo dopo l'ok del cliente.
   Lo stato buono lo scrive scripts/patch-academy-audit-ott.mjs. */
const BORSE_TABLE = {
  _key: 'tab-borse',
  _type: 'contentTable',
  caption: 'Borse di studio di merito',
  columns: ['Per chi', 'Quante', 'Importo'],
  rows: [
    ['Iscritti al 2° anno di Bachelor', '5', '500€'],
    ['Iscritti al 3° anno di Bachelor', '5', '500€'],
    ['Iscritti al 1° anno di Master', '5', '500€'],
    ['Corsi pre-accademici, adulti', '3', '250€'],
    ['Corsi pre-accademici, bambini e ragazzi', '3', '250€'],
  ].map((cells, i) => ({ _key: `tab-borse-r${i}`, _type: 'tableRow', cells })),
}

/* le sei sedi Erasmus a chip, sotto l'etichetta "Dove" */
const ERASMUS_CHIPS = {
  _key: 'chips-erasmus',
  _type: 'chipList',
  label: 'Dove',
  items: ['Siviglia', 'Berlino', 'Coimbra', 'Heraklion', 'Praga', 'Malta'],
}

/* righe dei contatti (etichetta—testo): segreteria esclusa, è gialla */
const CONTACT_BLOCKS = [
  block('ctc-tel-h', 'telefono', 'h4'),
  block('ctc-tel-p', '051 631 3706 (lun–ven)'),
  block('ctc-wa-h', 'whatsapp', 'h4'),
  block('ctc-wa-p', '+39 351 843 1456 (anche per studenti internazionali)'),
  block('ctc-mail-h', 'email', 'h4'),
  block('ctc-mail-p', 'hello@bologna-creativehub.it'),
]
const CONTACT_KEYS = new Set(CONTACT_BLOCKS.map((b) => b._key))

/* ---------- patch ---------- */

const page = await client.fetch(
  '*[_type == "page" && pageId == "servizi-studenti"][0]{ _id, sections }'
)
if (!page?._id) {
  console.error('doc page servizi-studenti non trovato')
  process.exit(1)
}

const titleOf = (s) => s?.title?.it ?? ''

/* l'intro già in pagina vince su quella di questo script: dall'audit di
   ott 2026 è una griglia indice ancorata, scritta da
   scripts/patch-academy-audit-ott.mjs, e non va sostituita con le
   vecchie card di solo testo */
const introInPagina = (page.sections ?? []).find((s) => s._key === 'ss-intro')
let sections = (page.sections ?? []).filter((s) => s._key !== 'ss-intro')

sections = sections.map((s) => {
  const out = { ...s }
  const title = titleOf(s)

  if (BRIEFS[title]) out.brief = { it: BRIEFS[title] }

  if (title === 'Pagare meno.') {
    /* la tabella delle borse resta fuori (vedi nota su BORSE_TABLE):
       qui ci si limita a toglierla se un vecchio giro l'aveva messa */
    out.body = {
      ...out.body,
      it: (out.body?.it ?? []).filter((b) => b._key !== 'tab-borse'),
    }
  }

  if (title === 'Partire con Erasmus+.') {
    /* il paragrafo secco "Dove" diventa etichetta + chip delle sedi */
    const blocks = (out.body?.it ?? [])
      .filter((b) => b._key !== 'chips-erasmus')
      .map((b) => {
        const text = (b.children ?? []).map((c) => c.text ?? '').join('').trim()
        return b._type === 'block' && text === 'Dove' ? ERASMUS_CHIPS : b
      })
    if (!blocks.some((b) => b._key === 'chips-erasmus')) blocks.unshift(ERASMUS_CHIPS)
    out.body = { ...out.body, it: blocks }
  }

  if (title === 'Un referente per ogni domanda.') {
    const blocks = (out.body?.it ?? []).filter((b) => !CONTACT_KEYS.has(b._key))
    out.body = { ...out.body, it: [...blocks, ...CONTACT_BLOCKS] }
  }

  return out
})

sections = [introInPagina ?? introSection, ...sections]

await client.patch(page._id).set({ sections }).commit()

console.log(`✓ servizi-studenti (${page._id})`)
console.log(`  intro "Di cosa hai bisogno?": ${INTRO_CARDS.length} card`)
console.log(`  brief: ${Object.keys(BRIEFS).length} sezioni`)
console.log(`  tabella borse: ${BORSE_TABLE.rows.length} righe`)
console.log(`  Erasmus+: etichetta "Dove" + ${ERASMUS_CHIPS.items.length} chip`)
console.log('  contatti: telefono / whatsapp / email (segreteria esclusa: gialla)')
