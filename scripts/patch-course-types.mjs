/**
 * Assegna il campo `types` ai corsi (filtri academy:
 * triennio / magistrale / finanziato / gratuito / custom).
 * Uso: node scripts/patch-course-types.mjs
 * Idempotente: setIfMissing + set esplicito per slug noti.
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

/* slug → tipologie plausibili per i dati demo */
const BY_SLUG = {
  'sound-engineering': ['triennio', 'finanziato'],
  'produzione-musica-elettronica': ['triennio'],
  'graphic-design-identita-visiva': ['triennio'],
  'creative-coding-media-interattivi': ['magistrale'],
  'postproduzione-audio-video': ['magistrale', 'finanziato'],
  'mixing-mastering': ['custom'],
  'songwriting-produzione-pop': ['custom', 'gratuito'],
  'tecnico-suono-live': ['finanziato', 'gratuito'],
}

const courses = await client.fetch('*[_type == "course"]{ _id, slug, types }')
let patched = 0
for (const c of courses) {
  const wanted = BY_SLUG[c.slug?.current]
  if (!wanted) continue
  if (JSON.stringify(c.types) === JSON.stringify(wanted)) continue
  await client.patch(c._id).set({ types: wanted }).commit()
  console.log(`✓ ${c.slug.current} → ${wanted.join(', ')}`)
  patched++
}
console.log(`fatto: ${patched} corsi aggiornati su ${courses.length}`)
