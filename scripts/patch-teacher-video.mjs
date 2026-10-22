/**
 * I video degli insegnanti di canto (ott 2026).
 *
 * Nel mockup HTML `lezioni-su-misura/canto.html` tre insegnanti hanno
 * un video YouTube vero (`data-yt`): finisce nel campo `videoUrl` del
 * documento `teacher`, così lo slider della pagina lezione mostra il
 * ritratto come poster e carica il player SOLO al clic.
 *
 * Gli altri insegnanti nel mockup sono marcati "video da girare": sono
 * gialli, quindi qui non c'è niente per loro — resta la sola foto.
 *
 * IDEMPOTENTE: rilegge i documenti e scrive solo dove `videoUrl` manca
 * o è diverso; rilanciarlo non cambia niente.
 *
 * Uso: node scripts/patch-teacher-video.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [
      l.slice(0, l.indexOf('=')).trim(),
      l.slice(l.indexOf('=') + 1).trim(),
    ])
)

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: env.SANITY_API_TOKEN || env.SANITY_TOKEN || env.SANITY_API_READ_TOKEN,
  apiVersion: '2026-01-01',
  useCdn: false,
})

/* nome del docente → video del mockup */
const VIDEO = {
  'Stefania Martin': 'https://www.youtube.com/watch?v=BbbGYp2YJBY',
  'Daniela Galli': 'https://www.youtube.com/watch?v=LXsBbdLNlmI',
  'Martina Spertino': 'https://www.youtube.com/watch?v=-WU8rFKUBoM',
}

const docs = await client.fetch(
  `*[_type == "teacher" && name in $names]{ _id, name, videoUrl }`,
  { names: Object.keys(VIDEO) }
)

let done = 0
for (const doc of docs) {
  const url = VIDEO[doc.name]
  if (doc.videoUrl === url) {
    console.log(`= ${doc.name}: già a posto`)
    continue
  }
  if (!dryRun) await client.patch(doc._id).set({ videoUrl: url }).commit()
  done += 1
  console.log(`+ ${doc.name}: ${url}`)
}

const mancanti = Object.keys(VIDEO).filter(
  (n) => !docs.some((d) => d.name === n)
)
for (const n of mancanti) console.log(`! ${n}: nessun documento teacher`)
console.log(`${done} docenti aggiornati${dryRun ? ' (dry run)' : ''}`)
