/**
 * Seed dei documenti sectionMedia (Media del sito → Foto delle pagine):
 * per ogni pagina crea/aggiorna il doc con gli slot etichettati e la
 * foto ATTUALE del repo già caricata, così dal CMS si vede cosa si sta
 * sostituendo. La specifica degli slot vive in scripts/foto-pagine.spec.json
 * e DEVE combaciare con gli slot letti dal codice delle pagine.
 * Idempotente (upload per sha1 + createOrReplace).
 * Esegui: node scripts/seed-foto-pagine.mjs
 */
import 'dotenv/config'
import { createReadStream, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
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
const SPEC = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'foto-pagine.spec.json'),
    'utf8',
  ),
)

/* stesso file usato da più slot/pagine → un solo upload */
const uploaded = new Map()
async function uploadImage(relPath) {
  if (uploaded.has(relPath)) return uploaded.get(relPath)
  const asset = await client.assets.upload(
    'image',
    createReadStream(join(ROOT, relPath)),
    { filename: basename(relPath) },
  )
  uploaded.set(relPath, asset._id)
  console.log('  img ', relPath, '→', asset._id)
  return asset._id
}

async function run() {
  for (const page of SPEC) {
    const docId = `media-${page.pageId.replace(/\//g, '-')}`
    console.log(`— ${page.title} (${docId}) —`)
    const slots = []
    for (const s of page.slots) {
      const id = await uploadImage(s.file)
      slots.push({
        _type: 'mediaSlot',
        _key: s.slot,
        slot: s.slot,
        label: s.label,
        image: {
          _type: 'image',
          _key: `${s.slot}-img`,
          asset: { _type: 'reference', _ref: id },
        },
      })
    }
    await client.createOrReplace({
      _id: docId,
      _type: 'sectionMedia',
      pageId: page.pageId,
      title: page.title,
      slots,
    })
    console.log(`✓ ${docId}: ${slots.length} slot`)
  }
}

run().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
