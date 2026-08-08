/**
 * Importa i corsi universitari (I ciclo + Master of Music) e i 55 docenti,
 * con le foto reali del cliente.
 *
 * Sorgente: ~/Downloads/corsi-universitari-web — cartella già selezionata e
 * ottimizzata (2400px lato lungo, JPEG q82, niente EXIF) dallo zip "Corsi
 * Universitari"; foto stock, .url, crop email e duplicati sono esclusi lì.
 * I ritratti stanno in `_docenti/<Nome Cognome>.jpg`.
 *
 * Uso:
 *   node scripts/import-corsi-universitari.mjs --dry-run
 *   node scripts/import-corsi-universitari.mjs
 *
 * Idempotente: _id deterministici + riuso degli asset per sha1.
 * NON tocca i corsi demo del seed: vanno rimossi a parte, quando il
 * cliente conferma.
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
const MEDIA = join(homedir(), 'Downloads', 'corsi-universitari-web')
const MAX_GALLERY = 8

/* ————— i corsi, dai PDF degli ordinamenti —————
   `dirs`: cartelle sorgente (Creative Musicianship ne ha 7, una per
   specializzazione strumentale: è un corso solo). */
const CORSI = [
  {
    id: 'course-uni-creative-musicianship',
    slug: 'creative-musicianship',
    it: 'Creative Musicianship',
    en: 'Creative Musicianship',
    titolo: { it: 'Bachelor of Music — BMus (Hons) Level 6', en: 'Bachelor of Music — BMus (Hons) Level 6' },
    tipo: 'triennio',
    category: 'courseCategory-musica',
    dirs: [
      'Creative Musicianship - Canto',
      'Creative Musicianship - Chitarra',
      'Creative Musicianship - Pianoforte e Tastiere',
      'Creative Musicianship - Basso',
      'Creative Musicianship - Batteria e Percussioni',
      'Creative Musicianship - Fiati',
      'Creative Musicianship - Archi',
    ],
    summary: {
      it: 'Voce e tutti gli strumenti: canto, chitarra, pianoforte e tastiere, basso, batteria e percussioni, fiati, archi. Un’ora di lezione individuale a settimana e musica d’insieme.',
      en: 'Voice and every instrument: singing, guitar, piano and keyboards, bass, drums and percussion, wind, strings. One hour of one-to-one tuition a week plus ensemble playing.',
    },
  },
  {
    id: 'course-uni-popular-music',
    slug: 'popular-music-performance-songwriting',
    it: 'Popular Music Performance & Songwriting',
    en: 'Popular Music Performance & Songwriting',
    titolo: { it: 'Bachelor of Arts — BA (Hons) Level 6', en: 'Bachelor of Arts — BA (Hons) Level 6' },
    tipo: 'triennio',
    category: 'courseCategory-musica',
    dirs: ['Popular Music Performance & Songwriting'],
    summary: {
      it: 'Performance e scrittura di canzoni: dal palco alla stesura del brano, con produzioni reali e docenti che lavorano nell’industria.',
      en: 'Performance and songwriting: from the stage to the finished song, with real productions and teachers working in the industry.',
    },
  },
  {
    id: 'course-uni-urban-music-production',
    slug: 'urban-music-production',
    it: 'Urban Music Production',
    en: 'Urban Music Production',
    titolo: { it: 'Bachelor of Arts — BA (Hons) Level 6', en: 'Bachelor of Arts — BA (Hons) Level 6' },
    tipo: 'triennio',
    category: 'courseCategory-suono',
    dirs: ['Urban Music Production'],
    summary: {
      it: 'Produzione urban: beatmaking, sound design e scrittura, dal controller alla release.',
      en: 'Urban production: beatmaking, sound design and writing, from the controller to the release.',
    },
  },
  {
    id: 'course-uni-music-technology',
    slug: 'music-technology',
    it: 'Music Technology',
    en: 'Music Technology',
    titolo: { it: 'Bachelor of Science — BSc (Hons) Level 6', en: 'Bachelor of Science — BSc (Hons) Level 6' },
    tipo: 'triennio',
    category: 'courseCategory-suono',
    dirs: ['Music Technology'],
    summary: {
      it: 'Le tecnologie audio e le tecniche di produzione: creare, registrare e mixare musica a livello professionale.',
      en: 'Audio technology and production technique: creating, recording and mixing music to a professional standard.',
    },
  },
  {
    id: 'course-uni-film-production',
    slug: 'film-production',
    it: 'Film Production',
    en: 'Film Production',
    titolo: { it: 'Bachelor of Arts — BA (Hons) Level 6', en: 'Bachelor of Arts — BA (Hons) Level 6' },
    tipo: 'triennio',
    category: 'courseCategory-visual',
    dirs: ['Film Production'],
    summary: {
      it: 'Regia, ripresa, montaggio e post-produzione: il film dalla sceneggiatura alla copia finale.',
      en: 'Directing, shooting, editing and post: the film from script to final cut.',
    },
  },
  {
    id: 'course-uni-music-business',
    slug: 'music-business',
    it: 'Music Business',
    en: 'Music Business',
    titolo: { it: 'Higher National Diploma (BTEC) Level 5', en: 'Higher National Diploma (BTEC) Level 5' },
    tipo: 'triennio',
    category: 'courseCategory-multimedia',
    dirs: ['Music Business'],
    summary: {
      it: 'Il mestiere dietro la musica: management, editoria, distribuzione, live e diritti.',
      en: 'The business behind the music: management, publishing, distribution, live and rights.',
    },
  },
  {
    id: 'course-uni-mm-direction',
    slug: 'musical-direction-planning-leadership',
    it: 'Musical Direction, Planning & Leadership',
    en: 'Musical Direction, Planning & Leadership',
    titolo: { it: 'Master of Music', en: 'Master of Music' },
    tipo: 'magistrale',
    category: 'courseCategory-musica',
    dirs: ['Musical Direction, Planning & Leadership'],
    summary: {
      it: 'Da esecutore a direzione: guidare una formazione, progettare una produzione, condurre un team.',
      en: 'From performer to director: leading an ensemble, planning a production, running a team.',
    },
  },
  {
    id: 'course-uni-mm-arrangement',
    slug: 'professional-arrangement-composition',
    it: 'Professional Arrangement & Composition',
    en: 'Professional Arrangement & Composition',
    titolo: { it: 'Master of Music', en: 'Master of Music' },
    tipo: 'magistrale',
    category: 'courseCategory-musica',
    dirs: ['Professional Arrangement & Composition'],
    summary: {
      it: 'Arrangiamento e composizione a livello professionale, per disco, scena e immagine.',
      en: 'Professional-level arrangement and composition, for records, stage and screen.',
    },
  },
  {
    id: 'course-uni-mm-production',
    slug: 'professional-production-sound-design',
    it: 'Professional Production & Sound Design',
    en: 'Professional Production & Sound Design',
    titolo: { it: 'Master of Music', en: 'Master of Music' },
    tipo: 'magistrale',
    category: 'courseCategory-suono',
    dirs: ['Professional Production & Sound Design'],
    summary: {
      it: 'Produzione e sound design avanzati: dal progetto artistico al master, con la strumentazione dello studio.',
      en: 'Advanced production and sound design: from artistic concept to master, on the studio’s own gear.',
    },
  },
]

const COMUNE = {
  mode: { it: 'in sede', en: 'on site' },
  language: { it: 'italiano · inglese', en: 'Italian · English' },
  startDate: { it: 'ottobre 2026', en: 'October 2026' },
}

/* ————— utility ————— */

function foto(dir) {
  const base = join(MEDIA, dir)
  if (!existsSync(base)) return []
  const out = []
  const walk = (d) => {
    for (const n of readdirSync(d).sort()) {
      const full = join(d, n)
      if (statSync(full).isDirectory()) {
        if (!/ocenti/i.test(n)) walk(full) // i ritratti stanno nei teacher
      } else if (extname(n).toLowerCase() === '.jpg') out.push(full)
    }
  }
  walk(base)
  return out
}

/** varianti dello stesso scatto ("3.1", "3.2") → una sola */
function gruppoDi(p) {
  const stem = basename(p, extname(p))
  const m = stem.match(/^(.*?)(\d+)(?:\.\d+)?$/)
  return m ? `${m[1]}${m[2]}` : stem
}
function unaPerScatto(paths) {
  const g = new Map()
  for (const f of paths) {
    const k = `${basename(dirname(f))}/${gruppoDi(f)}`
    const prev = g.get(k)
    if (!prev || statSync(f).size > statSync(prev).size) g.set(k, f)
  }
  return [...g.values()]
}

const cache = new Map()
async function upload(path) {
  const buf = readFileSync(path)
  const sha1 = createHash('sha1').update(buf).digest('hex')
  if (cache.has(sha1)) return cache.get(sha1)
  const found = await client.fetch(
    '*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]._id',
    { sha1 }
  )
  if (found) {
    cache.set(sha1, found)
    return found
  }
  if (dryRun) return `(nuovo)`
  const a = await client.assets.upload('image', buf, { filename: basename(path) })
  cache.set(sha1, a._id)
  return a._id
}

const imgRef = (id, key) => ({
  _type: 'image',
  ...(key ? { _key: key } : {}),
  asset: { _type: 'reference', _ref: id },
})

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/* ————— 1. docenti ————— */

const DOC_DIR = join(MEDIA, '_docenti')
const docenti = existsSync(DOC_DIR)
  ? readdirSync(DOC_DIR).filter((f) => f.endsWith('.jpg')).sort()
  : []

const idDocente = new Map()
for (const file of docenti) {
  const nome = basename(file, '.jpg')
  const id = `teacher-${slugify(nome)}`
  idDocente.set(nome, id)
  const photo = imgRef(await upload(join(DOC_DIR, file)))
  if (!dryRun) {
    /* patch invece di createOrReplace: se il cliente ha scritto bio o
       ruolo nello Studio non glieli cancelliamo */
    await client
      .createIfNotExists({ _id: id, _type: 'teacher', name: nome })
      .then(() =>
        client
          .patch(id)
          .set({
            name: nome,
            slug: { _type: 'slug', current: slugify(nome) },
            photo,
          })
          .commit()
      )
  }
}
console.log(`docenti: ${docenti.length}`)

/* ————— 2. corsi ————— */

/* nome docente → cartelle in cui compare la sua foto, generato in fase di
   selezione dei media; serve a collegare i teacher ai corsi giusti */
const mappaDocenti = JSON.parse(
  readFileSync(join(MEDIA, '_docenti-corsi.json'), 'utf8')
)

for (const c of CORSI) {
  /* una lista per cartella, poi round-robin: Creative Musicianship ha 7
     specializzazioni e prendendo le prime N alfabetiche la galleria
     mostrerebbe solo gli archi */
  const perDir = c.dirs.map((d) => unaPerScatto(foto(d)).sort())
  const tutte = []
  for (let i = 0; ; i++) {
    const giro = perDir.map((l) => l[i]).filter(Boolean)
    if (!giro.length) break
    tutte.push(...giro)
  }
  if (!tutte.length) {
    console.log(`✗ ${c.it}: nessuna foto`)
    continue
  }
  const cover = tutte[0]
  const gallery = tutte.slice(1, 1 + MAX_GALLERY)

  /* docenti che compaiono nelle cartelle di questo corso */
  const suoi = Object.entries(mappaDocenti)
    .filter(([, dirs]) => dirs.some((d) => c.dirs.includes(d)))
    .map(([nome]) => idDocente.get(nome))
    .filter(Boolean)

  const doc = {
    _id: c.id,
    _type: 'course',
    title: { _type: 'localeString', it: c.it, en: c.en },
    slug: { _type: 'slug', current: c.slug },
    category: { _type: 'reference', _ref: c.category },
    types: [c.tipo],
    summary: { _type: 'localeText', ...c.summary },
    level: { _type: 'localeString', ...c.titolo },
    duration: { _type: 'localeString', it: c.tipo === 'magistrale' ? 'master' : 'tre anni', en: c.tipo === 'magistrale' ? "master's" : 'three years' },
    mode: { _type: 'localeString', ...COMUNE.mode },
    language: { _type: 'localeString', ...COMUNE.language },
    startDate: { _type: 'localeString', ...COMUNE.startDate },
    coverImage: imgRef(await upload(cover)),
    featured: c.tipo === 'triennio',
  }
  doc.gallery = []
  for (const [i, f] of gallery.entries()) {
    doc.gallery.push(imgRef(await upload(f), `g${i}`))
  }
  if (suoi.length) {
    doc.teachers = suoi.map((id, i) => ({
      _type: 'reference',
      _key: `t${i}`,
      _ref: id,
    }))
  }

  console.log(
    `${dryRun ? '·' : '✓'} ${c.it.slice(0, 40).padEnd(42)} foto ${String(
      1 + gallery.length
    ).padStart(2)}/${tutte.length}  docenti ${suoi.length}`
  )
  if (!dryRun) await client.createOrReplace(doc)
}

console.log(`\n${dryRun ? 'dry-run · ' : ''}${CORSI.length} corsi, ${docenti.length} docenti`)
