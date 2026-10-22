/**
 * Allinea il corso Music Data Analyst & Strategist al mockup del cliente
 * (pagine-html 2/academy/formazione-finanziata/music-data-analyst-and-strategist.html),
 * dove i corpi delle fisarmoniche — chiusi nei PDF — erano leggibili.
 *
 * Il mockup ha DUE sezioni distinte, non una:
 *   · "Chi può partecipare." → requisiti formali, sostanziali, criteri preferenziali
 *   · "Iscrizione."        → scadenza, come iscriversi, costo
 * In Sanity erano schiacciate tutte dentro `admissions`, che il template
 * rendeva come un'unica sequenza numerata 01–05. Qui le separiamo:
 * `admissions` tiene i requisiti, il nuovo campo `enrollment` l'iscrizione.
 *
 * NON si pubblicano le voci gialle del mockup (dati da confermare):
 *   · "Età e condizione lavorativa" (limiti di età / riservato a disoccupati)
 *   · "Documenti da presentare" (elenco documenti)
 *   · "Graduatoria" (il PDF non ha un link: la frase da sola è un vicolo cieco)
 *
 * Uso: node scripts/patch-ff-iscrizione.mjs
 * Idempotente: _key fissi e set esplicito, rilanciarlo non cambia nulla.
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

const SLUG = 'music-data-analyst-and-strategist'

/* una voce titolo+testo della scheda: _key fisso = patch idempotente */
const entry = (key, title, text) => ({
  _key: key,
  _type: 'object',
  title: { _type: 'localeString', it: title },
  text: { _type: 'localeText', it: text },
})

/* "Chi può partecipare." — i tre requisiti del mockup, parola per parola */
const admissions = [
  entry(
    'req-formali',
    'Requisiti formali',
    "Residenza o domicilio in Emilia-Romagna prima dell'iscrizione · assolvimento dell'obbligo d'istruzione e del diritto-dovere all'istruzione e formazione · diploma di scuola superiore o qualifica/diploma professionale almeno di livello EQF 4.",
  ),
  entry(
    'req-sostanziali',
    'Requisiti sostanziali',
    'Competenze informatiche di base (Office o Google Workspace, file multimediali, cloud) · conoscenza di base delle principali piattaforme social e musicali: Spotify, YouTube, Instagram, TikTok, SoundCloud.',
  ),
  entry(
    'req-preferenziali',
    'Criteri preferenziali',
    'Basi di analisi dati (formule Excel, filtri, tabelle pivot) · familiarità con Spotify o Apple Music for Artists, YouTube, TikTok o Instagram Analytics · nozioni di API, Python o SQL, o di strumenti ETL come Airflow, Fivetran, Talend.',
  ),
]

/* "Iscrizione." — solo le voci non gialle del mockup */
const enrollment = [
  entry(
    'isc-scadenza',
    'Scadenza',
    'Le iscrizioni a questa edizione si sono chiuse il 7 settembre 2026.',
  ),
  entry(
    'isc-come',
    'Come iscriversi',
    'Per la prossima edizione lascia il contatto qui sotto: ti scriviamo appena esce il bando, con le date e i requisiti.',
  ),
  entry('isc-costo', 'Costo', 'Nessuno: il corso è gratuito.'),
]

const doc = await client.fetch(
  `*[_type == "course" && slug.current == $slug][0]{ _id }`,
  { slug: SLUG },
)
if (!doc?._id) {
  console.error(`Corso "${SLUG}" non trovato.`)
  process.exit(1)
}

await client.patch(doc._id).set({ admissions, enrollment }).commit()

console.log(`${doc._id}: admissions ${admissions.length} voci, enrollment ${enrollment.length} voci.`)
