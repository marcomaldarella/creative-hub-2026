/**
 * Traduzione automatica it→en dei contenuti Sanity via DeepL.
 * Uso:
 *   node scripts/translate-deepl.mjs [--dry-run] [--type <tipo>] [--overwrite]
 *
 * Legge SANITY_API_TOKEN e DEEPL_API_KEY da .env.local — nessuna dipendenza dotenv.
 * Trova ricorsivamente gli oggetti locale ({ it, en }) dove it è valorizzato e en manca,
 * traduce con DeepL (it → en-GB) e scrive patch puntuali su Sanity.
 * Vedi docs/TRANSLATION.md.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@sanity/client'

/* ---------- env ---------- */

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = {}
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
}

/* ---------- cli ---------- */

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const overwrite = args.includes('--overwrite')
const typeIndex = args.indexOf('--type')
const onlyType = typeIndex !== -1 ? args[typeIndex + 1] : null

/** tipi di documento con campi localizzati (partner ne è privo: solo name/logo/url) */
const LOCALIZED_TYPES = [
  'siteSettings',
  'teacher',
  'courseCategory',
  'course',
  'author',
  'category',
  'article',
  'space',
  'page',
]

if (onlyType && !LOCALIZED_TYPES.includes(onlyType)) {
  console.error(`Tipo sconosciuto: "${onlyType}". Tipi validi: ${LOCALIZED_TYPES.join(', ')}`)
  process.exit(1)
}

const token = env.SANITY_API_TOKEN
if (!token) {
  console.error('SANITY_API_TOKEN mancante in .env.local')
  process.exit(1)
}

const deeplKey = env.DEEPL_API_KEY
if (!deeplKey && !dryRun) {
  console.error(
    'DEEPL_API_KEY mancante in .env.local.\n' +
      'Ottieni una chiave gratuita su https://www.deepl.com/pro-api e aggiungila a .env.local.\n' +
      'Puoi comunque vedere cosa verrebbe tradotto con: node scripts/translate-deepl.mjs --dry-run'
  )
  process.exit(1)
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder',
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2026-07-01',
  token,
  useCdn: false,
})

/* ---------- riconoscimento oggetti locale ---------- */

const LOCALE_TYPES = new Set(['localeString', 'localeText', 'localeBlock'])
const LOCALE_KEYS = new Set(['_type', '_key', 'it', 'en'])

/**
 * Un oggetto è "locale" se ha _type localeString/localeText/localeBlock,
 * oppure se le sue chiavi sono un sottoinsieme di {_type,_key,it,en} con it/en
 * di tipo stringa o array (i seed via API possono omettere _type).
 */
function isLocaleObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  if (LOCALE_TYPES.has(value._type)) return true
  const keys = Object.keys(value)
  if (!keys.includes('it') && !keys.includes('en')) return false
  if (!keys.every((k) => LOCALE_KEYS.has(k))) return false
  const ok = (v) => v === undefined || v === null || typeof v === 'string' || Array.isArray(v)
  return ok(value.it) && ok(value.en)
}

const isFilled = (v) =>
  typeof v === 'string' ? v.trim() !== '' : Array.isArray(v) ? v.length > 0 : false

/* ---------- raccolta dei campi da tradurre ---------- */

/**
 * Attraversa ricorsivamente il documento e raccoglie task di traduzione.
 * task = { docId, docType, path, kind: 'string'|'block', it }
 * path usa la notazione puntata di Sanity, con selettori [_key=="…"] per gli array.
 */
function collectTasks(doc) {
  const tasks = []

  function walk(value, path) {
    if (value === null || typeof value !== 'object') return

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const seg =
          item && typeof item === 'object' && typeof item._key === 'string'
            ? `${path}[_key=="${item._key}"]`
            : `${path}[${index}]`
        walk(item, seg)
      })
      return
    }

    if (isLocaleObject(value)) {
      if (!isFilled(value.it)) return
      if (isFilled(value.en) && !overwrite) return
      tasks.push({
        docId: doc._id,
        docType: doc._type,
        path,
        kind: Array.isArray(value.it) ? 'block' : 'string',
        it: value.it,
      })
      return
    }

    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('_')) continue
      walk(v, path ? `${path}.${k}` : k)
    }
  }

  walk(doc, '')
  return tasks
}

/* ---------- estrazione/reinserimento testi (portable text incluso) ---------- */

/**
 * Per un task restituisce i testi da mandare a DeepL.
 * - string/text: un solo testo.
 * - block: solo i campi text degli span dentro i children dei block
 *   (i blocchi image e gli altri tipi non vengono toccati).
 */
function extractTexts(task) {
  if (task.kind === 'string') return [task.it]
  const texts = []
  for (const blk of task.it) {
    if (blk?._type !== 'block' || !Array.isArray(blk.children)) continue
    for (const child of blk.children) {
      if (child?._type === 'span' && typeof child.text === 'string' && child.text.trim() !== '') {
        texts.push(child.text)
      }
    }
  }
  return texts
}

/**
 * Ricostruisce il valore en a partire dalle traduzioni (nello stesso ordine
 * di extractTexts). Per i block: clona la struttura it preservando _key,
 * marks, markDefs e style, sostituendo solo i text degli span.
 */
function buildEnValue(task, translations) {
  if (task.kind === 'string') return translations[0]
  let i = 0
  return task.it.map((blk) => {
    if (blk?._type !== 'block' || !Array.isArray(blk.children)) {
      return structuredClone(blk) // immagini e altri tipi: copiati intatti
    }
    return {
      ...structuredClone(blk),
      children: blk.children.map((child) => {
        if (child?._type === 'span' && typeof child.text === 'string' && child.text.trim() !== '') {
          return { ...structuredClone(child), text: translations[i++] }
        }
        return structuredClone(child)
      }),
    }
  })
}

const preview = (task) => {
  const text = task.kind === 'string' ? task.it : extractTexts(task).join(' ')
  return text.length > 60 ? `${text.slice(0, 57)}…` : text
}

/* ---------- deepl (batch sequenziali, rispetta il rate limit free) ---------- */

const DEEPL_BATCH_SIZE = 40 // testi per chiamata (DeepL accetta fino a 50)
const DEEPL_PAUSE_MS = 600 // pausa tra le chiamate

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function translateAll(texts) {
  const deepl = await import('deepl-node')
  const translator = new deepl.Translator(deeplKey)
  const out = []
  const batches = Math.ceil(texts.length / DEEPL_BATCH_SIZE)
  for (let b = 0; b < batches; b++) {
    const chunk = texts.slice(b * DEEPL_BATCH_SIZE, (b + 1) * DEEPL_BATCH_SIZE)
    console.log(`  DeepL: batch ${b + 1}/${batches} (${chunk.length} testi)…`)
    const results = await translator.translateText(chunk, 'it', 'en-GB', {
      preserveFormatting: true,
    })
    for (const r of results) out.push(r.text)
    if (b < batches - 1) await sleep(DEEPL_PAUSE_MS)
  }
  return out
}

/* ---------- scrittura patch su sanity ---------- */

const PATCH_BATCH_SIZE = 20 // documenti per transaction

async function writePatches(patchesByDoc) {
  const ids = [...patchesByDoc.keys()]
  for (let b = 0; b < ids.length; b += PATCH_BATCH_SIZE) {
    const slice = ids.slice(b, b + PATCH_BATCH_SIZE)
    let tx = client.transaction()
    for (const id of slice) {
      tx = tx.patch(client.patch(id).set(patchesByDoc.get(id)))
    }
    const result = await tx.commit()
    console.log(`  Sanity: transaction ${result.transactionId} (${slice.length} documenti)`)
  }
}

/* ---------- esecuzione ---------- */

async function run() {
  const types = onlyType ? [onlyType] : LOCALIZED_TYPES
  console.log(
    `translate-deepl — ${client.config().projectId}/${client.config().dataset}` +
      `${dryRun ? ' [dry-run]' : ''}${overwrite ? ' [overwrite]' : ''}` +
      `${onlyType ? ` [type: ${onlyType}]` : ''}`
  )

  const docs = await client.fetch('*[_type in $types && !(_id in path("drafts.**"))]', { types })
  console.log(`${docs.length} documenti scaricati (tipi: ${types.join(', ')})\n`)

  const tasks = []
  for (const doc of docs) {
    const docTasks = collectTasks(doc)
    if (docTasks.length === 0) continue
    console.log(`${doc._type}  ${doc._id}`)
    for (const task of docTasks) {
      console.log(`  ${task.path}.en  ←  "${preview(task)}"`)
      tasks.push(task)
    }
  }

  console.log(`\n${tasks.length} campi da tradurre in ${new Set(tasks.map((t) => t.docId)).size} documenti.`)
  if (tasks.length === 0) {
    console.log('Niente da fare.')
    return
  }
  if (dryRun) {
    console.log('[dry-run] Nessuna chiamata a DeepL, nessuna scrittura su Sanity.')
    return
  }

  // Batching: un unico array piatto di testi, chunk sequenziali verso DeepL.
  const flat = []
  const slices = tasks.map((task) => {
    const texts = extractTexts(task)
    const start = flat.length
    flat.push(...texts)
    return { start, length: texts.length }
  })

  console.log(`\nTraduzione di ${flat.length} testi con DeepL (it → en-GB)…`)
  const translated = await translateAll(flat)

  const patchesByDoc = new Map()
  tasks.forEach((task, i) => {
    const { start, length } = slices[i]
    const enValue = buildEnValue(task, translated.slice(start, start + length))
    const patch = patchesByDoc.get(task.docId) ?? {}
    patch[`${task.path}.en`] = enValue
    patchesByDoc.set(task.docId, patch)
  })

  console.log(`\nScrittura patch su ${patchesByDoc.size} documenti…`)
  await writePatches(patchesByDoc)
  console.log('Fatto.')
}

run().catch((err) => {
  console.error('translate-deepl fallito:', err.message)
  process.exit(1)
})
