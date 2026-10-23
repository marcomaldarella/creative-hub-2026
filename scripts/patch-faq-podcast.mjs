/* le quattro domande del mockup podcast: tre non avevano risposta nel
   file del cliente, qui sono scritte con quello che la pagina già dice
   — nessun prezzo e nessun numero inventato. Idempotente. */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/* il token sta in .env.local, letto a mano come negli altri script */
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
const FAQ = [
  ['Quante persone entrano in cabina?',
   'La cabina è pensata per una voce per volta, con il fonico in regia. Gli ospiti possono collegarsi a distanza: li registriamo insieme a te, su tracce separate.'],
  ['Fate anche il montaggio?',
   'Sì: montaggio, pulizia dell’audio e master, pronti da pubblicare.'],
  ['Posso registrare una serie di episodi?',
   'Sì. Si organizzano più sessioni e si lavora a pacchetto: scrivici quanti episodi hai in mente e in quanto tempo.'],
  ['Quanto costa?',
   'Dipende da quante voci registri, dalla durata e da quanto montaggio serve. Dopo una breve consulenza ti mandiamo un preventivo.'],
]
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)
const blocchi = FAQ.flatMap(([q, a]) => ([
  { _type: 'block', _key: 'q-' + key(q), style: 'h3', markDefs: [],
    children: [{ _type: 'span', _key: 'qs-' + key(q), text: q, marks: [] }] },
  { _type: 'block', _key: 'a-' + key(q), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'as-' + key(q), text: a, marks: [] }] },
]))
const doc = await c.fetch('*[_type=="page" && pageId=="podcast"][0]{_id, sections}')
if (!doc) { console.log('documento podcast non trovato'); process.exit(0) }
const i = doc.sections.findIndex((s) =>
  (s.body?.it || []).some((b) => (b.children || []).some((ch) => /Fate anche il montaggio/i.test(ch.text || ''))))
if (i < 0) { console.log('sezione FAQ non trovata'); process.exit(0) }
await c.patch(doc._id).set({ [`sections[${i}].body.it`]: blocchi }).commit()
console.log('FAQ podcast aggiornate:', FAQ.length, 'domande')
