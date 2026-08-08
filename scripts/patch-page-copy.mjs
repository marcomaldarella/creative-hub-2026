/**
 * Allinea gli hero delle pagine editoriali (Sanity) ai testi definitivi
 * del cliente — docx "testi_sito_creative_hub_bologna" v.4, agosto 2026.
 *
 * Serve perché innovazione / chi-siamo / magazine leggono titolo e lede
 * dal documento `page` di Sanity: i fallback nei dizionari non si vedono
 * finché il documento esiste.
 *
 * Uso: node scripts/patch-page-copy.mjs [--dry-run]
 * Idempotente.
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

/* id documento → hero definitivo (it/en) */
const HERO = {
  innovazione: {
    title: {
      it: 'Le imprese creative nascono qui.',
      en: 'Creative companies start here.',
    },
    lede: {
      it: 'Incubazione, accelerazione, servizi alle imprese.',
      en: 'Incubation, acceleration, services for companies.',
    },
  },
  'chi-siamo': {
    title: { it: 'Dal 1999.', en: 'Since 1999.' },
    lede: {
      it: 'Un college, uno studio di registrazione, un coworking.',
      en: 'A college, a recording studio, a coworking space.',
    },
  },
  academy: {
    title: {
      it: "L'università delle industrie creative.",
      en: 'The university of the creative industries.',
    },
    lede: {
      it: 'Bachelor of Arts, Bachelor of Science e Master of Music in musica, sound e visual. Venti posti per corso, un’ora di lezione individuale a settimana.',
      en: 'Bachelor of Arts, Bachelor of Science and Master of Music in music, sound and visual. Twenty places per course, one hour of one-to-one tuition a week.',
    },
  },
  studio: {
    title: {
      it: "Registra come l'industria.",
      en: 'Record like the industry.',
    },
    lede: {
      it: 'Regia SSL XL Desk da 55 m². Sala live. ISO box. Tre cabine B-Ear.',
      en: '55 m² SSL XL Desk control room. Live room. ISO box. Three B-Ear cabins.',
    },
  },
  coworking: {
    title: {
      it: "Uno spazio all'altezza del tuo lavoro.",
      en: 'A space worthy of your work.',
    },
    lede: {
      it: 'Coworking, sale ed eventi. Zona Roveri, Bologna.',
      en: 'Coworking, rooms and events. Roveri district, Bologna.',
    },
  },
  magazine: {
    title: {
      it: 'Il mestiere, raccontato da chi lo fa.',
      en: 'The trade, told by those who do it.',
    },
    lede: {
      it: 'Quattro linee. Un solo settore.',
      en: 'Four strands. One industry.',
    },
  },
}

/* i documenti sono indicizzati dal campo `pageId`, non dall'_id */
const existing = await client.fetch(
  '*[_type == "page" && pageId in $ids]{ _id, pageId }',
  { ids: Object.keys(HERO) }
)
const idOf = new Map(existing.map((p) => [p.pageId, p._id]))

let tx = client.transaction()
let n = 0
for (const [pageId, hero] of Object.entries(HERO)) {
  const docId = idOf.get(pageId)
  if (!docId) {
    console.log(`— ${pageId}: nessun documento page, salto`)
    continue
  }
  console.log(`✎ ${pageId} (${docId}): "${hero.title.it}"`)
  tx = tx.patch(docId, (p) =>
    p.set({ 'hero.title': hero.title, 'hero.lede': hero.lede })
  )
  n++
}

if (dryRun) {
  console.log(`\ndry-run: ${n} pagine sarebbero aggiornate`)
} else if (n) {
  await tx.commit()
  console.log(`\n✓ ${n} pagine aggiornate`)
} else {
  console.log('\nnessuna pagina da aggiornare')
}
