/**
 * Seed dei media del sito in Sanity:
 *  - media-studios (sectionMedia): le 3 foto della pagina /studios negli
 *    slot etichettati, così dal CMS si vede cosa si sta sostituendo
 *  - mediaKit-sito (mediaKit): tutti i video + le foto di sezione, in un
 *    documento scaricabile dallo Studio (Media del sito → Archivio media)
 * Idempotente: upload per sha1 riusa gli asset, i doc sono createOrReplace.
 * Esegui: node scripts/seed-media-sito.mjs
 */
import 'dotenv/config'
import { createReadStream, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, basename } from 'node:path'
import { createClient } from '@sanity/client'

function writeToken() {
  if (process.env.SANITY_WRITE_TOKEN) return process.env.SANITY_WRITE_TOKEN
  try {
    const cfg = JSON.parse(
      readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8'),
    )
    if (cfg.authToken) return cfg.authToken
  } catch {}
  return process.env.SANITY_API_TOKEN
}

const client = createClient({
  projectId: 'if3942oc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: writeToken(),
})

const ROOT = join(process.cwd(), 'public')

async function uploadImage(relPath) {
  const file = join(ROOT, relPath)
  const asset = await client.assets.upload('image', createReadStream(file), {
    filename: basename(file),
  })
  console.log('  img ', basename(file), '→', asset._id)
  return asset._id
}

async function uploadFile(relPath) {
  const file = join(ROOT, relPath)
  const asset = await client.assets.upload('file', createReadStream(file), {
    filename: basename(file),
  })
  console.log('  file', basename(file), '→', asset._id)
  return asset._id
}

const imageRef = (id, key, extra = {}) => ({
  _type: 'image',
  _key: key,
  asset: { _type: 'reference', _ref: id },
  ...extra,
})

const fileRef = (id, key, label) => ({
  _type: 'file',
  _key: key,
  label,
  asset: { _type: 'reference', _ref: id },
})

/* ---------- 1. foto della pagina /studios, negli slot del codice ---------- */

const STUDIOS_SLOTS = [
  {
    slot: 'hero',
    label: 'Hero — foto grande a destra (regia principale)',
    file: 'img/sections/studio-regia.jpg',
  },
  {
    slot: 'duo-sinistra',
    label: 'Banda a due foto — sinistra, quadrata (regia dal centro)',
    file: 'img/sections/studio-desk.jpg',
  },
  {
    slot: 'duo-destra',
    label: 'Banda a due foto — destra, verticale (postazione SSL)',
    file: 'img/sections/studio-regia-b.jpg',
  },
]

/* ---------- 2. archivio scaricabile: tutti i video + foto di sezione ---------- */

const VIDEO_LABELS = {
  'node-academy.mp4': 'Hero home — slide Academy',
  'node-studio.mp4': 'Hero home — slide Studio',
  'node-coworking.mp4': 'Hero home — slide Coworking',
  'regia-ssl-8s-1920x1080.mp4': 'Hero pagina Registrazione — regia SSL',
  'hero-5s-1920x1080.mp4': 'Fascia "Dal 1999" (academy) — orizzontale',
  'hero-5s-1080x1920.mp4': 'Fascia "Dal 1999" (academy) — verticale',
  'hi-corsi.mp4': 'Card percorsi academy — corsi',
  'hi-studio.mp4': 'Card percorsi academy — studio',
  'percorso-uni.mp4': 'Card percorso universitario',
  'percorso-custom.mp4': 'Card percorso custom',
  'stage-open-day.mp4': 'Pagina open day',
}

async function run() {
  console.log('— slot pagina /studios —')
  const slots = []
  for (const s of STUDIOS_SLOTS) {
    const id = await uploadImage(s.file)
    slots.push({
      _type: 'mediaSlot',
      _key: s.slot,
      slot: s.slot,
      label: s.label,
      image: imageRef(id, `${s.slot}-img`),
    })
  }
  await client.createOrReplace({
    _id: 'media-studios',
    _type: 'sectionMedia',
    pageId: 'studios',
    title: 'Pagina Studio (/studios)',
    slots,
  })
  console.log('✓ media-studios scritto')

  console.log('— archivio media —')
  const videos = []
  for (const name of readdirSync(join(ROOT, 'video')).filter((f) =>
    f.endsWith('.mp4'),
  )) {
    const id = await uploadFile(`video/${name}`)
    videos.push(
      fileRef(id, name.replace(/\W+/g, '-'), VIDEO_LABELS[name] ?? name),
    )
  }
  const fotoArchivio = []
  for (const s of STUDIOS_SLOTS) {
    const id = await uploadImage(s.file)
    fotoArchivio.push(
      imageRef(id, basename(s.file).replace(/\W+/g, '-'), {
        label: `Pagina Studio — ${s.label}`,
      }),
    )
  }
  await client.createOrReplace({
    _id: 'mediaKit-sito',
    _type: 'mediaKit',
    title: 'Archivio media del sito',
    note: 'Copia scaricabile dei video e delle foto montati nel sito (gli originali vivono nel codice). Per i video: aprire la voce e usare il download del file.',
    video: videos,
    foto: fotoArchivio,
  })
  console.log('✓ mediaKit-sito scritto')
}

run().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
