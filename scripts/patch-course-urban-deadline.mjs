/**
 * Urban Music Production: scrive la scadenza delle candidature, che nel
 * mockup (academy/urban-music-production.html) è il secondo dato della
 * hero — "30 giugno 2026 · Scadenza candidature (posti limitati)".
 *
 * Il numero di posti resta dov'è già scritto, nell'accordion ammissioni
 * ("Venti posti all'anno"): nella hero bastano etichetta e data.
 *
 * Uso: node scripts/patch-course-urban-deadline.mjs
 * Idempotente: scrive solo se il valore è diverso da quello atteso.
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

const SLUG = 'urban-music-production'
const VALUE = { _type: 'localeString', it: '30 giugno 2026', en: '30 June 2026' }

const course = await client.fetch(
  '*[_type == "course" && slug.current == $slug][0]{_id, applicationDeadline}',
  { slug: SLUG }
)
if (!course) {
  console.log(`${SLUG}: corso assente, salto`)
} else if (
  course.applicationDeadline?.it === VALUE.it &&
  course.applicationDeadline?.en === VALUE.en
) {
  console.log(`${SLUG}: già allineato`)
} else {
  await client.patch(course._id).set({ applicationDeadline: VALUE }).commit()
  console.log(`${SLUG}: scadenza candidature impostata`)
}
