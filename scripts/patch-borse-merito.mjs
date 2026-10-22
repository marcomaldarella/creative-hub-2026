/**
 * Tabella "Borse di studio di merito" nella sezione "Pagare meno." del
 * doc page servizi-studenti (mockup academy/servizi-studenti): era
 * l'unico blocco del mockup mai importato. Idempotente: se la tabella
 * c'è già non la duplica. Esegui: node scripts/patch-borse-merito.mjs
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@sanity/client'

/* il token in .env.local è di sola lettura: per scrivere si usa quello
   della CLI Sanity, già autenticata su questa macchina */
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

const ROWS = [
  ['Iscritti al 2° anno di Bachelor', '5', '500€'],
  ['Iscritti al 3° anno di Bachelor', '5', '500€'],
  ['Iscritti al 1° anno di Master', '5', '500€'],
  ['Corsi pre-accademici, adulti', '3', '250€'],
  ['Corsi pre-accademici, bambini e ragazzi', '3', '250€'],
]

const table = (locale) => ({
  _key: 'borse-merito',
  _type: 'contentTable',
  caption:
    locale === 'en' ? 'Merit scholarships' : 'Borse di studio di merito',
  columns:
    locale === 'en'
      ? ['Who for', 'How many', 'Amount']
      : ['Per chi', 'Quante', 'Importo'],
  rows: ROWS.map((cells, i) => ({
    _key: `borse-r${i + 1}`,
    _type: 'tableRow',
    cells:
      locale === 'en'
        ? [
            [
              'Students in year 2 of a Bachelor',
              'Students in year 3 of a Bachelor',
              'Students in year 1 of a Master',
              'Pre-academic courses, adults',
              'Pre-academic courses, children and teens',
            ][i],
            cells[1],
            cells[2],
          ]
        : cells,
  })),
})

const doc = await client.fetch(
  '*[_type=="page" && pageId=="servizi-studenti"][0]{_id, sections}',
)
if (!doc) throw new Error('doc servizi-studenti non trovato')

const idx = doc.sections.findIndex((s) => /pagare meno/i.test(s.title?.it ?? ''))
if (idx < 0) throw new Error('sezione "Pagare meno." non trovata')

const sec = doc.sections[idx]
const patch = {}
let touched = false

for (const locale of ['it', 'en']) {
  const body = sec.body?.[locale]
  if (!Array.isArray(body) || body.length === 0) continue
  if (body.some((b) => b._type === 'contentTable')) continue
  /* la tabella va subito dopo il paragrafo d'apertura, prima di
     "Come si assegnano" */
  const at = body.findIndex((b) => b.style === 'h4' || b.style === 'h3')
  const pos = at < 0 ? body.length : at
  patch[`sections[${idx}].body.${locale}`] = [
    ...body.slice(0, pos),
    table(locale),
    ...body.slice(pos),
  ]
  touched = true
}

if (!touched) {
  console.log('tabella già presente: niente da fare')
} else {
  await client.patch(doc._id).set(patch).commit()
  console.log('tabella borse inserita in', Object.keys(patch).join(', '))
}
