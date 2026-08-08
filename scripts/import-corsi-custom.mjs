/**
 * Importa i corsi custom per strumento (card di Academy, filtro "custom")
 * con le foto reali del cliente.
 *
 * Sorgente: ~/Downloads/corsi-custom-web — la cartella già selezionata e
 * ottimizzata (2400px lato lungo, JPEG q82, niente EXIF) a partire dallo
 * zip "Corsi Custom". Foto stock, reference, loghi e duplicati sono già
 * stati esclusi lì.
 *
 * Uso:
 *   node scripts/import-corsi-custom.mjs --dry-run
 *   node scripts/import-corsi-custom.mjs
 *
 * Idempotente su due livelli: i documenti hanno _id deterministico, e gli
 * asset immagine vengono riusati se già caricati (match per hash SHA-1 del
 * file, che è come Sanity indicizza gli asset).
 */

import { createHash } from 'node:crypto'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname, basename } from 'node:path'
import { homedir } from 'node:os'
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
const MEDIA = join(homedir(), 'Downloads', 'corsi-custom-web')

/* copy condivisa dei corsi custom — docx v.4, sezione "07 — corsi custom".
   Il testo per singolo strumento non esiste ancora: quando arriva va in
   `summary`, questo è il fallback comune. */
const SHARED = {
  summary: {
    it: 'Una lezione individuale a settimana, anche di sera. Pacchetti da 4, 20 o 40 lezioni, sale e strumentazione incluse. La prima lezione è gratis.',
    en: 'One one-to-one lesson a week, evenings included. Packages of 4, 20 or 40 lessons, rooms and gear included. The first lesson is free.',
  },
  duration: { it: 'pacchetti da 4, 20 o 40 lezioni', en: 'packages of 4, 20 or 40 lessons' },
  level: { it: 'tutti i livelli', en: 'all levels' },
  mode: { it: 'in sede o online', en: 'on site or online' },
  startDate: { it: 'tutto l’anno', en: 'all year round' },
  language: { it: 'italiano · inglese', en: 'Italian · English' },
}

/* strumento → documento. `dir` è la cartella dentro corsi-custom-web,
   `cover` la foto di copertina (percorso relativo a quella cartella). */
const CORSI = [
  {
    id: 'course-custom-basso',
    dir: 'Basso',
    it: 'Basso',
    en: 'Bass',
    slug: 'corso-custom-basso',
    category: 'courseCategory-musica',
    cover: 'Basso/In Spazio Attrezzato - Giovane - Femmina - 16-9.jpg',
  },
  {
    id: 'course-custom-chitarra',
    dir: 'Chitarra',
    it: 'Chitarra',
    en: 'Guitar',
    slug: 'corso-custom-chitarra',
    category: 'courseCategory-musica',
    cover: 'Chitarra/Foto/9.1.jpg',
  },
  {
    id: 'course-custom-canto',
    dir: 'Canto',
    it: 'Canto',
    en: 'Voice',
    slug: 'corso-custom-canto',
    category: 'courseCategory-musica',
    cover: 'Canto/Chi fa canto può fare anche altri strumenti.jpg',
  },
  {
    id: 'course-custom-batteria',
    dir: 'Batteria e Percussioni',
    it: 'Batteria e percussioni',
    en: 'Drums and percussion',
    slug: 'corso-custom-batteria-percussioni',
    category: 'courseCategory-musica',
    cover: 'Batteria e Percussioni/Foto Batterista.jpg',
  },
  {
    id: 'course-custom-produzione',
    dir: 'Production',
    it: 'Produzione musicale',
    en: 'Music production',
    slug: 'corso-custom-produzione-musicale',
    category: 'courseCategory-suono',
    cover: 'Production/3.jpg',
  },
  {
    id: 'course-custom-dj',
    dir: 'DJ',
    it: 'DJ',
    en: 'DJing',
    slug: 'corso-custom-dj',
    category: 'courseCategory-musica',
    cover: 'DJ/4.jpg',
  },
  {
    /* cartella vuota: le foto sono nel materiale del corso universitario,
       che deve ancora arrivare. Il documento si crea comunque, senza foto. */
    id: 'course-custom-pianoforte',
    dir: 'Pianoforte e Tastiere',
    it: 'Pianoforte e tastiere',
    en: 'Piano and keyboards',
    slug: 'corso-custom-pianoforte-tastiere',
    category: 'courseCategory-musica',
    cover: null,
  },
]

/** quante foto in galleria per corso, oltre alla copertina */
const MAX_GALLERY = 8

function listFotos(dir) {
  const base = join(MEDIA, dir)
  if (!existsSync(base)) return []
  const out = []
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const full = join(d, name)
      if (statSync(full).isDirectory()) walk(full)
      else if (extname(name).toLowerCase() === '.jpg') out.push(full)
    }
  }
  walk(base)
  return out
}

/**
 * Il cliente nomina le varianti dello STESSO scatto con un suffisso
 * decimale: "… - 1.1", "… - 1.2", "2.4", "2.5". Senza raggrupparle la
 * galleria mostra cinque volte la stessa foto.
 * Chiave = nome fino al numero intero incluso → "1.1" e "1.2" stanno
 * insieme, "2.1" fa gruppo a sé.
 */
function gruppoDi(path) {
  const stem = basename(path, extname(path))
  const m = stem.match(/^(.*?)(\d+)(?:\.\d+)?$/)
  return m ? `${m[1]}${m[2]}` : stem
}

/** una foto per scatto: la più grande del gruppo */
function unaPerScatto(paths) {
  const gruppi = new Map()
  for (const f of paths) {
    const k = gruppoDi(f)
    const prev = gruppi.get(k)
    if (!prev || statSync(f).size > statSync(prev).size) gruppi.set(k, f)
  }
  return [...gruppi.values()].sort()
}

/* Sanity indicizza gli asset per SHA-1: se il file è già stato caricato
   riusiamo l'_id invece di duplicare lo storage (e la bolletta). */
const cache = new Map()
async function uploadImage(path) {
  const buf = readFileSync(path)
  const sha1 = createHash('sha1').update(buf).digest('hex')
  if (cache.has(sha1)) return cache.get(sha1)
  const existing = await client.fetch(
    '*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]._id',
    { sha1 }
  )
  if (existing) {
    cache.set(sha1, existing)
    return existing
  }
  if (dryRun) return `(nuovo) ${basename(path)}`
  const asset = await client.assets.upload('image', buf, {
    filename: basename(path),
  })
  cache.set(sha1, asset._id)
  return asset._id
}

const imgRef = (assetId, key) => ({
  _type: 'image',
  ...(key ? { _key: key } : {}),
  asset: { _type: 'reference', _ref: assetId },
})

let nuovi = 0
let caricate = 0

for (const c of CORSI) {
  const fotos = listFotos(c.dir)
  const coverPath = c.cover ? join(MEDIA, c.cover) : null
  if (coverPath && !existsSync(coverPath)) {
    console.log(`✗ ${c.it}: copertina non trovata → ${c.cover}`)
    continue
  }

  const doc = {
    _id: c.id,
    _type: 'course',
    title: { _type: 'localeString', it: c.it, en: c.en },
    slug: { _type: 'slug', current: c.slug },
    category: { _type: 'reference', _ref: c.category },
    types: ['custom'],
    summary: { _type: 'localeText', ...SHARED.summary },
    duration: { _type: 'localeString', ...SHARED.duration },
    level: { _type: 'localeString', ...SHARED.level },
    mode: { _type: 'localeString', ...SHARED.mode },
    startDate: { _type: 'localeString', ...SHARED.startDate },
    language: { _type: 'localeString', ...SHARED.language },
    featured: false,
  }

  if (coverPath) {
    const id = await uploadImage(coverPath)
    doc.coverImage = imgRef(id)
    caricate++
  }

  const gallery = unaPerScatto(
    fotos.filter((f) => gruppoDi(f) !== (coverPath ? gruppoDi(coverPath) : null))
  ).slice(0, MAX_GALLERY)
  if (gallery.length) {
    doc.gallery = []
    for (const [i, f] of gallery.entries()) {
      const id = await uploadImage(f)
      doc.gallery.push(imgRef(id, `g${i}`))
      caricate++
    }
  }

  console.log(
    `${dryRun ? '·' : '✓'} ${c.it.padEnd(24)} copertina: ${
      c.cover ? basename(c.cover) : '—'
    }  · galleria: ${gallery.length}/${fotos.length}`
  )

  if (!dryRun) {
    /* createOrReplace: rilanciarlo riallinea il documento senza duplicati.
       ATTENZIONE: sovrascrive anche le modifiche fatte a mano nello Studio. */
    await client.createOrReplace(doc)
  }
  nuovi++
}

console.log(
  `\n${dryRun ? 'dry-run: ' : ''}${nuovi} corsi · ${caricate} immagini ${
    dryRun ? 'da caricare' : 'caricate/riusate'
  }`
)
