/**
 * Aggiunge al corso Music Data Analyst & Strategist le due sezioni del
 * mockup del cliente: "Come funziona la selezione." (voci pesate 55/40/5)
 * e "Con chi lavori." (soggetti attuatori e promotori).
 * Le tre voci "Selezione: …" già schiacciate dentro le ammissioni vengono
 * tolte: ora vivono nella sezione dedicata.
 * Uso: node scripts/patch-selezione-rete.mjs
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

const SLUG = 'music-data-analyst-and-strategist'

/* "Come funziona la selezione." — tre voci pesate, dal mockup */
const selectionLede = {
  it: "I posti sono al massimo 14: entra chi ottiene il punteggio più alto. Prima della selezione verifichiamo i documenti d'identità; la graduatoria è pubblicata sul sito e inviata via email.",
}
const selection = [
  {
    _key: 'sel-prova-scritta',
    _type: 'object',
    weight: '55%',
    title: { it: 'Prova scritta' },
    text: {
      it: 'Test di inglese, test tecnico su informatica, analisi dei dati e conoscenza del settore, più una domanda motivazionale.',
    },
  },
  {
    _key: 'sel-colloquio',
    _type: 'object',
    weight: '40%',
    title: { it: 'Colloquio individuale' },
    text: { it: 'Per capire motivazione e attitudine al ruolo.' },
  },
  {
    _key: 'sel-preferenziali',
    _type: 'object',
    weight: '5%',
    title: { it: 'Criteri preferenziali' },
    text: {
      it: 'Basi di analisi dati, conoscenza degli analytics delle piattaforme, nozioni di API, Python, SQL o strumenti ETL, se documentate.',
    },
  },
]

/* "Con chi lavori." — le due colonne della rete, nomi separati da " · " */
const networkLede = {
  it: 'Il corso è costruito con aziende, etichette e professionisti della filiera musicale.',
}
const network = [
  {
    _key: 'net-attuatori',
    _type: 'object',
    title: { it: 'Soggetti attuatori' },
    text: {
      it: 'MPDA Aps · DOC Servizi · Note Legali · Materiali Musicali · Mister Smart Innovation · Freecom · Airpixel · Fausto De Bellis · Enrico Ornielli · Totem Music Lab · Luca Jacoboni · Ringraziachesonounasignora · Atelier Musicale International · Borsi di Annalisa Borsari',
    },
  },
  {
    _key: 'net-promotori',
    _type: 'object',
    title: { it: 'Soggetti promotori' },
    text: {
      it: 'Clust-ER Create · Miraloop · Media Match & Music Jobs · Makeathousand · Pearson · Fondazione Entroterre · Esibirsi · Panico Sghetto Records · Alessandro Ceccarelli Management',
    },
  },
]

const course = await client.fetch(
  '*[_type == "course" && slug.current == $slug][0]{ _id, admissions }',
  { slug: SLUG },
)
if (!course?._id) {
  console.error(`corso non trovato: ${SLUG}`)
  process.exit(1)
}

/* le ammissioni perdono le voci "Selezione: …", ora sezione dedicata */
const admissions = (course.admissions ?? []).filter(
  (it) => !(it?.title?.it ?? '').startsWith('Selezione:'),
)
const removed = (course.admissions ?? []).length - admissions.length

await client
  .patch(course._id)
  .set({ selectionLede, selection, networkLede, network, admissions })
  .commit()

console.log(`✓ ${SLUG} (${course._id})`)
console.log(`  selezione: lede + ${selection.length} voci pesate`)
console.log(`  rete: lede + ${network.length} colonne`)
console.log(`  ammissioni: tolte ${removed} voci "Selezione: …" (restano ${admissions.length})`)
