/**
 * Bonifica dei "gialli" pubblicati per errore (ott 2026): note interne
 * "da confermare" finite online nelle FAQ del corso custom di chitarra.
 *
 *  - "Sì. confermare età minima"            → "Sì."
 *  - "… confermare se c'è anche chitarra classica" → cade solo la nota
 *
 * I segnaposto docenti e i "da confermare" di rette/ammissioni su
 * /academy/urban-music-production vivevano nel template
 * (components/mockup/templates/v3.ts) e sono stati tolti lì.
 *
 * Patcha sia il documento pubblicato che l'eventuale draft, così la
 * nota non riaffiora a una pubblicazione successiva.
 *
 * Uso: node scripts/patch-bonifica-gialli.mjs [--dry-run]
 * Idempotente: riscrive solo i testi che contengono ancora la nota.
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

/* _key della voce FAQ → testo pulito (solo it: le note erano solo it) */
const FIXES = {
  course: 'course-custom-chitarra',
  faq: {
    /* "Mio figlio può fare lezioni di chitarra?" */
    '1156fac2c68b': 'Sì.',
    /* "Che stili posso studiare?" */
    '38d6f6f2c17f':
      'Rock, blues, funk, indie, alternative, neo-soul, jazz fusion, fingerstyle: scegli tu i brani su cui lavorare.',
  },
}

const ids = [FIXES.course, `drafts.${FIXES.course}`]
const docs = await client.getDocuments(ids)

for (const doc of docs) {
  if (!doc) continue
  const patch = client.patch(doc._id)
  let dirty = false
  for (const [key, clean] of Object.entries(FIXES.faq)) {
    const item = (doc.faq ?? []).find((f) => f._key === key)
    if (!item) {
      console.log(`∅ ${doc._id}: faq ${key} non trovata, salto`)
      continue
    }
    const current = item.text?.it ?? ''
    if (current === clean) {
      console.log(`= ${doc._id}: faq ${key} già pulita`)
      continue
    }
    if (!/confermare/i.test(current)) {
      console.log(`? ${doc._id}: faq ${key} diversa dall'atteso, non tocco: "${current}"`)
      continue
    }
    console.log(`→ ${doc._id}: faq ${key}\n   da: "${current}"\n   a:  "${clean}"`)
    patch.set({ [`faq[_key=="${key}"].text.it`]: clean })
    dirty = true
  }
  if (!dirty) continue
  if (dryRun) {
    console.log(`(dry-run) ${doc._id}: patch non inviata`)
    continue
  }
  await patch.commit()
  console.log(`✓ ${doc._id} aggiornato`)
}

console.log('Fatto.')
