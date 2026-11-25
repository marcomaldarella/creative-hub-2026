/**
 * Seed del TEAM (staff dell'hub) per chi-siamo "Le persone".
 * Fonte: https://bologna-creativehub.it/team/ (25/11/2026) — nomi, ruoli
 * e foto nell'ordine della pagina. Manuela Manni e Pamela Pettine sul
 * vecchio sito hanno il placeholder: qui restano senza foto (la griglia
 * mette il gradiente).
 * Uso: node scripts/seed-team.mjs
 * Idempotente: createOrReplace con _id deterministici teamMember-<slug>.
 * Scrive con SANITY_WRITE_TOKEN (SANITY_API_TOKEN è read-only).
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

const token = env.SANITY_WRITE_TOKEN
if (!token) {
  console.error('SANITY_WRITE_TOKEN mancante in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-06-01',
  token,
  useCdn: false,
})

const WP = 'https://bologna-creativehub.it/wp-content/uploads'

const TEAM = [
  ['massimiliano-magagni', 'Massimiliano Magagni', 'CEO - Co-Founder', 'CEO - Co-Founder', '2022/03/max-magagni.png'],
  ['susanna-goldoni', 'Susanna Goldoni', 'Co-Founder', 'Co-Founder', '2022/05/25.jpg'],
  ['manuela-manni', 'Manuela Manni', 'COO - Coordinamento generale', 'COO - General coordination', null],
  ['daniela-galli', 'Daniela Galli', 'Welcome Manager', 'Welcome Manager', '2022/09/FOTO-TEAM-CH.png'],
  ['nicolo-zilocchi', 'Nicolo Zilocchi', 'Coordinatore corsi Universitari', 'University courses coordinator', '2025/06/zilocchi_750-Modificata.png'],
  ['pamela-pettine', 'Pamela Pettine', 'Coordinatore Corsi Formazione Emilia Romagna', 'Emilia-Romagna training courses coordinator', null],
  ['martina-torreggiani', 'Martina Torreggiani', 'Coordinatore Corsi Custom', 'Custom courses coordinator', '2025/06/torreggiani_750-Modificata.png'],
  ['giacomo-golfieri', 'Giacomo Golfieri', 'Student Career Service', 'Student Career Service', '2025/07/Golfieri.png'],
  ['emanuele-boselli', 'Emanuele Boselli', 'Progettazione Didattica/Editoria', 'Learning design / Publishing', '2022/03/emanuele-boselli.png'],
  ['anna-minguzzi', 'Anna Minguzzi', 'Tutor / Project manager', 'Tutor / Project manager', '2026/06/Progetto-senza-titolo.png'],
  ['flavio-grilli', 'Flavio Grilli', 'Tutor / Project manager', 'Tutor / Project manager', '2022/03/flavio-grilli.png'],
  ['jessica-colaianni', 'Jessica Colaianni', 'Operations Manager', 'Operations Manager', '2024/07/Jessica-2.png'],
  ['alessandro-cosentino', 'Alessandro Cosentino', 'Studio manager', 'Studio manager', '2024/09/Alesssandro-Cosentino.png'],
  ['luca-larice', 'Luca Larice', 'Web Developer', 'Web Developer', '2022/03/luca-larice.png'],
  ['francis-seriau', 'Francis Seriau', 'Mentoring', 'Mentoring', '2022/03/francis.png'],
  ['lorela-mehmeti', 'Lorela Mehmeti', 'Createch Venture Club', 'Createch Venture Club', '2025/06/mehemeti_750-Modificata.png'],
]

for (let i = 0; i < TEAM.length; i++) {
  const [slug, name, roleIt, roleEn, photoPath] = TEAM[i]

  let photo
  if (photoPath) {
    const url = `${WP}/${photoPath}`
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`foto KO (${res.status}): ${url}`)
      process.exit(1)
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const asset = await client.assets.upload('image', buf, {
      filename: `team-${slug}${photoPath.endsWith('.jpg') ? '.jpg' : '.png'}`,
    })
    photo = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
    console.log(`foto ${name} → ${asset._id}`)
  }

  await client.createOrReplace({
    _id: `teamMember-${slug}`,
    _type: 'teamMember',
    name,
    role: { _type: 'localeString', it: roleIt, en: roleEn },
    order: i + 1,
    ...(photo ? { photo } : {}),
  })
  console.log(`doc ${name} (order ${i + 1})`)
}

console.log('seed team completo:', TEAM.length, 'membri')
