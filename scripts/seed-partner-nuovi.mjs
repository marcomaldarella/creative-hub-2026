/**
 * Partner nuovi dal docx "Home page" del 23/11 (idempotente,
 * createIfNotExists: i doc esistenti non vengono toccati).
 *
 * Con logo in public/img/partners (pacchetto "loghi-partner-creative-hub"):
 * i nomi DEVONO combaciare con le chiavi del map di PartnerMark.tsx.
 * Senza logo (file non fornito): il Marquee/griglia degrada al nome
 * testuale — quando l'ente manda il file basta aggiungerlo al map.
 *
 * Uso: node scripts/seed-partner-nuovi.mjs
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@sanity/client'

const token = JSON.parse(
  readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8')
).authToken

const client = createClient({
  projectId: 'if3942oc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

/* ordine: in coda ai 12 esistenti (0–11) */
const PARTNERS = [
  /* — con logo nel repo — */
  { id: 'art-er', name: 'ART-ER', url: 'https://www.art-er.it/' },
  {
    id: 'its-academy-adriano-olivetti',
    name: 'ITS Academy Adriano Olivetti',
    url: 'https://www.itsadrianolivetti.it/',
  },
  {
    id: 'emilia-romagna-startup',
    name: 'Emilia-Romagna Startup',
    url: 'https://www.emiliaromagnastartup.it/',
  },
  { id: 'artes-4-0', name: 'ARTES 4.0', url: 'https://artes4.it/' },
  {
    id: 'clust-er-create',
    name: 'Clust-ER Create',
    url: 'https://create.clust-er.it/',
  },
  {
    id: 'incredibol',
    name: 'Incredibol!',
    url: 'https://www.incredibol.net/',
  },
  {
    id: 'erasmus-young-entrepreneurs',
    name: 'Erasmus for Young Entrepreneurs',
    url: 'https://www.erasmus-entrepreneurs.eu/',
  },
  { id: 'hub-cultura-creativita', name: 'Hub Cultura e Creatività' },
  /* — senza logo (fallback testuale), url dal docx del cliente — */
  { id: 'adobe', name: 'Adobe', url: 'https://www.adobe.com/' },
  {
    id: 'solid-state-logic',
    name: 'Solid State Logic',
    url: 'https://solidstatelogic.com/',
  },
  { id: 'boxy', name: 'Boxy', url: 'https://www.boxysystem.com/it/' },
  { id: 'b-ear', name: 'B-Ear', url: 'https://www.b-ear.it/' },
  { id: 'midiware', name: 'Midiware', url: 'https://midiware.com/' },
  { id: 'genelec', name: 'Genelec', url: 'https://www.genelec.com/' },
  { id: 'ludwig', name: 'Ludwig', url: 'https://www.ludwig-drums.com/' },
  { id: 'fimi', name: 'FIMI', url: 'https://www.fimi.it/' },
  { id: 'scf', name: 'SCF', url: 'https://www.scfitalia.it/' },
  { id: 'esibirsi', name: 'Esibirsi', url: 'https://esibirsi.it/' },
  {
    id: 'ths-foundation',
    name: 'THS Foundation',
    url: 'https://tshtalentfoundation.org/',
  },
  { id: 'cricc', name: 'CRICC' },
  { id: 'cte-cobo', name: 'CTE COBO' },
  { id: 'in-er', name: 'IN-ER' },
  { id: 'assonanza', name: 'Assonanza' },
]

const BASE_ORDER = 12
let created = 0
for (const [i, p] of PARTNERS.entries()) {
  const doc = {
    _id: `partner-${p.id}`,
    _type: 'partner',
    name: p.name,
    order: BASE_ORDER + i,
    ...(p.url ? { url: p.url } : {}),
  }
  const res = await client.createIfNotExists(doc)
  if (res.order === doc.order && res.name === doc.name) created++
  console.log(`✔ ${doc._id} (${p.name})`)
}
console.log(`fatto: ${PARTNERS.length} doc garantiti`)
