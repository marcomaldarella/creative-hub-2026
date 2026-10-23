/* Bio e corsi dei docenti dal file del cliente ("BIO + CV - docenti
   2026 2027"). Idempotente: scrive solo dove il dato manca o è diverso,
   e non tocca i docenti che non compaiono nel file.
   Le bio troppo corte (segnaposto tipo "da inserire") vengono saltate. */
import { createClient } from '@sanity/client'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = {}
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}
const c = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
})

const dir = process.argv[2]
const sh = readFileSync(join(dir, 'xl/sharedStrings.xml'), 'utf8')
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&#10;/g, '\n').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&quot;/g, '"')
const testi = [...sh.matchAll(/<si>(.*?)<\/si>/gs)].map((m) => dec(m[1].replace(/<[^>]+>/g, '')))
const sheet = readFileSync(join(dir, 'xl/worksheets/sheet1.xml'), 'utf8')

const righe = []
for (const r of sheet.matchAll(/<row r="(\d+)"[^>]*>(.*?)<\/row>/gs)) {
  const cells = {}
  for (const cm of r[2].matchAll(/<c r="([A-Z]+)\d+"([^>]*)>(?:<v>(.*?)<\/v>)?/g)) {
    if (cm[3] === undefined) continue
    cells[cm[1]] = cm[2].includes('t="s"') ? testi[+cm[3]] : cm[3]
  }
  if (+r[1] > 1 && cells.A) righe.push({ nome: cells.A.trim(), corsi: (cells.B || '').trim(), bio: (cells.D || '').trim() })
}

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, '').trim()
const docenti = await c.fetch('*[_type=="teacher"]{_id, name, "ruolo": role.it, "bio": bio.it}')
const byName = new Map(docenti.map((d) => [norm(d.name || ''), d]))

let scritti = 0, saltati = 0, assenti = []
for (const r of righe) {
  if (r.bio.length < 60) { saltati++; continue }           // segnaposto
  const d = byName.get(norm(r.nome))
  if (!d) { assenti.push(r.nome); continue }
  const patch = {}
  if ((d.bio || '').trim() !== r.bio) patch['bio.it'] = r.bio
  /* il ruolo resta quello scritto a mano se c'è già: il file dà i corsi,
     non il mestiere */
  if (!d.ruolo && r.corsi) patch['role.it'] = r.corsi
  if (Object.keys(patch).length) { await c.patch(d._id).set(patch).commit(); scritti++ }
}
console.log(`bio scritte: ${scritti} · righe senza bio vera: ${saltati} · nomi non in Sanity: ${assenti.length}`)
if (assenti.length) console.log('  ', assenti.slice(0, 12).join(', '))

/* i docenti del file che in Sanity non esistevano: li creo con bio e
   corsi, senza foto (quelle arrivano a parte) */
if (process.argv.includes('--crea')) {
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  let nuovi = 0
  for (const r of righe) {
    if (r.bio.length < 60) continue
    if (byName.get(norm(r.nome))) continue
    await c.createIfNotExists({
      _id: `teacher-${slug(r.nome)}`,
      _type: 'teacher',
      name: r.nome,
      slug: { _type: 'slug', current: slug(r.nome) },
      role: { _type: 'localeString', it: r.corsi || undefined },
      bio: { _type: 'localeText', it: r.bio },
    })
    nuovi++
  }
  console.log('docenti creati:', nuovi)
}
