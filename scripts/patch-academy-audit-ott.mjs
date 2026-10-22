/**
 * Audit mockup-vs-live delle pagine academy (ott 2026), lato Sanity.
 *
 * stage-placement
 *  - "Chi ascolta le produzioni": i cinque nomi del Label Lab a chip
 *    (il titoletto non resta vuoto)
 *  - titolo della sezione domande senza numero: le altre due domande
 *    del mockup sono gialle e non si pubblicano, "Tre domande, tre
 *    risposte" sopra una sola domanda è una promessa non mantenuta
 *
 * servizi-studenti
 *  - "Di cosa hai bisogno?" diventa una griglia indice vera: sei card
 *    ss.01–ss.06 ancorate alle sezioni (#soldi #casa #estero
 *    #international #tutor #inclusione)
 *  - ogni sezione di servizio prende la sua ancora
 *  - via la tabella delle borse: nel mockup l'a.a. 2026/27 è giallo
 *    "da confermare", quindi quote e importi non vanno online
 *  - via la riga "Bandi aperti e graduatorie:", che nel mockup finisce
 *    su un link giallo a una pagina che non esiste ancora
 *  - restano i tre "in breve" non gialli (soldi, Erasmus+, DSA)
 *
 * Uso: node scripts/patch-academy-audit-ott.mjs [--dry-run]
 * Idempotente: rilegge il documento, lavora per _key fissi e per
 * titolo di sezione, rilanciarlo non cambia nulla.
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

const dryRun = process.argv.includes('--dry-run')
const log = []

/* ---------- contenuti ---------- */

/* i cinque nomi che ascoltano le produzioni del Label Lab */
const LABEL_LAB_CHIPS = {
  _key: 'chips-label-lab',
  _type: 'chipList',
  label: 'Chi ascolta le produzioni',
  items: [
    'Dario Pruneddu',
    'Beatrice Antolini',
    'Machweo',
    'Enrico Dolcetto',
    'Mameli',
  ],
}

/* le sei card dell'indice: sigla, titolo, riga, ancora di arrivo */
const INDEX_GRID = {
  _key: 'ss-index',
  _type: 'indexGrid',
  items: [
    ['ss.01', 'Voglio pagare meno.', 'Borse di merito, Early Bird, rate a tasso zero', 'soldi'],
    ['ss.02', 'Cerco casa a Bologna.', 'Residenze convenzionate e aiuto nella ricerca', 'casa'],
    ['ss.03', "Voglio un'esperienza all'estero.", 'Tirocini Erasmus+ di 3 mesi, spese coperte', 'estero'],
    ['ss.04', "Arrivo dall'estero.", 'Visto, lingua, alloggio · in English', 'international'],
    ['ss.05', 'Voglio qualcuno che mi segua.', 'Un tutor dedicato, dal primo giorno', 'tutor'],
    ['ss.06', 'Ho un DSA o una disabilità.', 'Percorsi personalizzati e spazi accessibili', 'inclusione'],
  ].map(([label, title, text, anchor]) => ({
    _key: `ss-index-${anchor}`,
    _type: 'indexCard',
    label,
    title,
    text,
    anchor,
  })),
}

/* l'ancora di ogni sezione di servizio, per titolo */
const ANCHORS = {
  'Pagare meno.': 'soldi',
  'Trovare casa a Bologna.': 'casa',
  'Partire con Erasmus+.': 'estero',
  'International students.': 'international',
  'Avere qualcuno che ti segue.': 'tutor',
  'Studiare con un DSA o una disabilità.': 'inclusione',
}

/* i tre "in breve" chiesti dall'audit: testo integrale dal mockup */
const BRIEFS = {
  'Pagare meno.':
    'Ci sono tre modi per ridurre il costo: le borse di studio di merito, lo sconto Early Bird se ti pre-iscrivi entro il 31 marzo, e le rate a tasso zero.',
  'Partire con Erasmus+.':
    "Tre mesi di tirocinio in un'azienda delle industrie creative in Europa. Volo, alloggio e una somma per le spese sono coperti.",
  'Studiare con un DSA o una disabilità.':
    "Costruiamo il percorso insieme a te: strumenti, tempi e modalità d'esame adatti, spazi accessibili. Scrivici prima di iscriverti.",
}

/* le sei sedi Erasmus a chip sotto l'etichetta "Dove" */
const ERASMUS_CHIPS = {
  _key: 'chips-erasmus',
  _type: 'chipList',
  label: 'Dove',
  items: ['Siviglia', 'Berlino', 'Coimbra', 'Heraklion', 'Praga', 'Malta'],
}

/* ---------- utilità ---------- */

const titleOf = (s) => s?.title?.it ?? ''
const textOf = (b) =>
  (b?.children ?? []).map((c) => c.text ?? '').join('').trim()

async function load(pageId) {
  const page = await client.fetch(
    '*[_type == "page" && pageId == $pageId][0]{ _id, sections }',
    { pageId }
  )
  if (!page?._id) {
    console.error(`doc page ${pageId} non trovato`)
    process.exit(1)
  }
  return page
}

/* confronto stabile: Sanity restituisce le chiavi in ordine suo, un
   ordine diverso non è una modifica */
function canon(value) {
  if (Array.isArray(value)) return value.map(canon)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, canon(value[k])])
    )
  }
  return value
}

async function save(pageId, page, sections) {
  if (
    JSON.stringify(canon(page.sections ?? [])) ===
    JSON.stringify(canon(sections))
  ) {
    log.push(`= ${pageId}: già allineato`)
    return
  }
  if (dryRun) {
    log.push(`~ ${pageId}: da aggiornare (dry run)`)
    return
  }
  await client.patch(page._id).set({ sections }).commit()
  log.push(`✓ ${pageId} (${page._id})`)
}

/* ---------- stage-placement ---------- */

{
  const page = await load('stage-placement')
  const sections = (page.sections ?? []).map((s) => {
    const out = { ...s }
    const title = titleOf(s)

    /* Label Lab: i nomi a chip subito dopo il cappello */
    if (title === "Un'etichetta dentro l'Academy.") {
      const blocks = (out.body?.it ?? []).filter(
        (b) => b._key !== LABEL_LAB_CHIPS._key
      )
      const after = blocks.findIndex((b) => b._type === 'block' && textOf(b))
      blocks.splice(after + 1, 0, LABEL_LAB_CHIPS)
      out.body = { ...out.body, it: blocks }
    }

    /* domande: un titolo che non promette un numero di risposte */
    if (/^tre domande/i.test(title)) {
      out.title = { ...out.title, it: 'Domande.' }
      if (out.title.en) out.title.en = 'Questions.'
    }

    return out
  })
  await save('stage-placement', page, sections)
}

/* ---------- servizi-studenti ---------- */

{
  const page = await load('servizi-studenti')
  const sections = (page.sections ?? []).map((s) => {
    const out = { ...s }
    const title = titleOf(s)

    /* l'intro diventa la griglia indice ancorata */
    if (s._key === 'ss-intro') {
      out.body = { ...out.body, it: [INDEX_GRID] }
      if (out.body.en) delete out.body.en
    }

    /* ogni sezione di servizio prende la sua ancora */
    if (ANCHORS[title]) out.anchor = ANCHORS[title]

    /* i tre "in breve" non gialli */
    if (BRIEFS[title]) out.brief = { ...out.brief, it: BRIEFS[title] }

    /* soldi: fuori la tabella delle borse, l'a.a. è da confermare */
    if (title === 'Pagare meno.') {
      out.body = {
        ...out.body,
        it: (out.body?.it ?? []).filter((b) => b._type !== 'contentTable'),
      }
    }

    /* Erasmus+: restano le sedi a chip, cade la riga dei bandi che nel
       mockup punta a una pagina non ancora pubblicata */
    if (title === 'Partire con Erasmus+.') {
      let blocks = (out.body?.it ?? []).filter(
        (b) => !/^bandi aperti e graduatorie/i.test(textOf(b))
      )
      if (!blocks.some((b) => b._key === ERASMUS_CHIPS._key)) {
        blocks = [ERASMUS_CHIPS, ...blocks]
      }
      out.body = { ...out.body, it: blocks }
    }

    return out
  })
  await save('servizi-studenti', page, sections)
}

for (const line of log) console.log(line)
