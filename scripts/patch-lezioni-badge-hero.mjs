/**
 * Badge della hero delle lezioni su misura (ott 2026): i mockup di
 * chitarra, pianoforte e produzione mostrano badge che non erano
 * ancora nel documento corso (campo `admissionsKeys`).
 *
 *  - chitarra    + "Nessuna esperienza richiesta"
 *  - pianoforte  + "Pianoforte, synth e DAW" (terza posizione)
 *  - produzione  + "Aula dedicata ad Ableton" (seconda posizione)
 *                + "Nessuna esperienza richiesta"
 *
 * Come i badge già presenti, le voci hanno solo il testo italiano: il
 * dataset non ha ancora le traduzioni di questo campo e `l()` ricade
 * sull'italiano.
 *
 * IDEMPOTENTE: rilegge il documento a ogni esecuzione e inserisce solo
 * i badge che mancano (confronto sul testo). Patcha anche l'eventuale
 * draft, così il badge non sparisce alla prima pubblicazione.
 *
 * Uso: node scripts/patch-lezioni-badge-hero.mjs [--dry-run]
 */

import { randomBytes } from 'node:crypto'
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

/* `at` = posizione in cui inserire (dal mockup); assente = in coda */
const BADGES = {
  'course-custom-chitarra': [{ it: 'Nessuna esperienza richiesta' }],
  'course-custom-pianoforte': [{ it: 'Pianoforte, synth e DAW', at: 2 }],
  'course-custom-produzione': [
    { it: 'Aula dedicata ad Ableton', at: 1 },
    { it: 'Nessuna esperienza richiesta' },
  ],
}

for (const [id, wanted] of Object.entries(BADGES)) {
  for (const docId of [id, `drafts.${id}`]) {
    /* rilettura a ogni passaggio: lo stato in Sanity è la verità */
    const doc = await client.getDocument(docId)
    if (!doc) continue
    const keys = [...(doc.admissionsKeys ?? [])]
    const added = []
    for (const badge of wanted) {
      if (keys.some((k) => k?.it === badge.it)) continue
      const item = {
        _key: randomBytes(6).toString('hex'),
        _type: 'localeString',
        it: badge.it,
      }
      if (typeof badge.at === 'number' && badge.at <= keys.length) {
        keys.splice(badge.at, 0, item)
      } else {
        keys.push(item)
      }
      added.push(badge.it)
    }
    if (!added.length) {
      console.log(`${docId}: già a posto`)
      continue
    }
    if (!dryRun) {
      await client.patch(docId).set({ admissionsKeys: keys }).commit()
    }
    console.log(
      `${docId}: +${added.length}${dryRun ? ' (dry run)' : ''} → ${added.join(' · ')}`
    )
  }
}
