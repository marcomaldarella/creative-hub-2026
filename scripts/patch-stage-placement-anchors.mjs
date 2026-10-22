/**
 * Dà un'ancora stabile a ogni sezione del documento `page`
 * stage-placement (mockup v2 academy/stage-placement.html).
 *
 * La pagina dedicata /academy/stage-placement non è più una topic page
 * generica: ogni sezione del mockup ha una forma propria (le tre carte
 * del percorso, le sei storie, la fascia Label Lab, la rete a quattro
 * colonne, le domande) e la pagina le riconosce dall'ancora, non dalla
 * posizione nell'array — così il cliente può riordinarle nello Studio
 * senza che la pagina si scomponga. Le stesse ancore alimentano l'indice
 * sticky e il link «Leggi le storie» della testata (#storie, che era già
 * l'unica ancora scritta a mano).
 *
 * Non scrive né cambia nessun testo: tocca SOLO il campo `anchor`.
 *
 * Uso: node scripts/patch-stage-placement-anchors.mjs [--dry-run]
 * Idempotente: confronta e patcha solo le sezioni senza l'ancora giusta.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@sanity/client'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

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

/* l'ancora si riconosce dall'occhiello della sezione: è l'unico campo
   che il cliente non cambia per caso, ed è quello che il mockup usa come
   nome della sezione. L'ordine è quello del mockup. */
const ANCHOR_BY_KICKER = [
  { kicker: 'il percorso', anchor: 'percorso' },
  { kicker: 'storie di mestiere', anchor: 'storie' },
  { kicker: 'label lab', anchor: 'label-lab' },
  { kicker: 'la rete', anchor: 'rete' },
  { kicker: 'domande', anchor: 'domande' },
  { kicker: 'open day', anchor: 'open-day' },
]

const doc = await client.fetch(
  '*[_type == "page" && pageId == "stage-placement"][0]{_id, sections}'
)

if (!doc?._id) {
  console.log('documento page stage-placement assente: niente da fare')
  process.exit(0)
}

const patch = {}
for (const [i, section] of (doc.sections ?? []).entries()) {
  const kicker = (section.kicker?.it ?? '').trim().toLowerCase()
  const wanted = ANCHOR_BY_KICKER.find((a) => a.kicker === kicker)
  if (!wanted) {
    console.log(`[${i}] occhiello «${kicker}» non previsto, non la tocco`)
    continue
  }
  if (section.anchor === wanted.anchor) {
    console.log(`[${i}] = ${kicker} → ancora già «${wanted.anchor}»`)
    continue
  }
  /* patch per _key, non per indice: se le sezioni si spostano l'ancora
     resta attaccata alla sezione giusta */
  patch[`sections[_key=="${section._key}"].anchor`] = wanted.anchor
  console.log(
    `[${i}] ~ ${kicker} → ancora «${wanted.anchor}»` +
      (section.anchor ? ` (era «${section.anchor}»)` : '')
  )
}

if (Object.keys(patch).length === 0) {
  console.log('nessuna ancora da scrivere')
  process.exit(0)
}
if (dryRun) {
  console.log('dry-run: niente scritto su Sanity')
  process.exit(0)
}

await client.patch(doc._id).set(patch).commit()
console.log(`✓ ${doc._id}: ${Object.keys(patch).length} ancore scritte`)
