/**
 * Allinea ai mockup (ott 2026) tre documenti:
 * - page `stage-placement`: i 5 nomi "Chi ascolta le produzioni" del Label
 *   Lab a chip; la sezione FAQ diventa "Domande." (nei mockup/HTML le altre
 *   due risposte sono segnaposto "da confermare con il Career Service")
 * - page `formazione-finanziata`: le 4 celle di "Gratuiti, ma non per
 *   tutti." (Chi può partecipare / Come si entra / Cosa ottieni / Quando)
 * - course `music-data-analyst-and-strategist`: nel network, "Panico
 *   Sghetto Records" diventa due voci distinte "Panico" e "Sghetto Records"
 * I numeri hero di stage-placement e formazione-finanziata vivono nei
 * dizionari (topics.*.points), non in Sanity.
 * Uso: node scripts/patch-stage-ff-mda-v2.mjs
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

const block = (key, text, style = 'normal') => ({
  _key: key,
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _key: `${key}-s`, _type: 'span', marks: [], text }],
})

const textOf = (b) => (b.children ?? []).map((c) => c.text ?? '').join('').trim()

/* ———————— stage-placement ———————— */

const LABEL_LAB_CHIPS = {
  _key: 'chips-label-lab',
  _type: 'chipList',
  label: 'Chi ascolta le produzioni',
  items: [
    'Dario Pruneddu',
    'Beatrice Antolini',
    'Machweo',
    'Enrico Dolcetto',
    'Mameli',
  ],
}

{
  const page = await client.fetch(
    '*[_type == "page" && pageId == "stage-placement"][0]{ _id, sections }'
  )
  if (!page?._id) {
    console.error('doc page stage-placement non trovato')
    process.exit(1)
  }

  const sections = (page.sections ?? []).map((s) => {
    const out = { ...s }

    if (s.title?.it === "Un'etichetta dentro l'Academy.") {
      /* il paragrafo secco "Chi ascolta le produzioni" diventa chip */
      const blocks = (out.body?.it ?? [])
        .filter((b) => b._key !== 'chips-label-lab')
        .map((b) =>
          b._type === 'block' && textOf(b) === 'Chi ascolta le produzioni'
            ? LABEL_LAB_CHIPS
            : b
        )
      if (!blocks.some((b) => b._key === 'chips-label-lab')) {
        /* fallback: subito dopo il paragrafo d'apertura */
        blocks.splice(1, 0, LABEL_LAB_CHIPS)
      }
      out.body = { ...out.body, it: blocks }
    }

    /* una sola Q&A reale (le altre due nei mockup e nell'HTML sono
       segnaposto "da confermare"): il titolo non può promettere tre */
    if (s.title?.it === 'Tre domande, tre risposte.') {
      out.title = { ...s.title, it: 'Domande.' }
    }

    return out
  })

  await client.patch(page._id).set({ sections }).commit()
  console.log(`✓ stage-placement (${page._id})`)
  console.log(`  Label Lab: ${LABEL_LAB_CHIPS.items.length} nomi a chip`)
  console.log('  FAQ: titolo "Domande." (le altre due risposte sono gialle)')
}

/* ———————— formazione-finanziata ———————— */

/* le 4 celle di "Gratuiti, ma non per tutti." (testi integrali dal mockup) */
const GRATUITI_CELLS = [
  [
    'Chi può partecipare',
    'Chi risiede o ha domicilio in Emilia-Romagna, con diploma o qualifica. Ogni corso ha i suoi requisiti specifici.',
  ],
  [
    'Come si entra',
    'Prova scritta, colloquio individuale e criteri preferenziali. La graduatoria è pubblicata sul sito.',
  ],
  [
    'Cosa ottieni',
    'Un attestato di frequenza o un certificato di specializzazione tecnica superiore (IFTS), secondo il corso.',
  ],
  [
    'Quando',
    'Le iscrizioni restano aperte poche settimane, quando esce il bando. Per non perderle, lascia il contatto.',
  ],
].flatMap(([titolo, testo], i) => [
  block(`gm-h${i}`, titolo, 'h3'),
  block(`gm-p${i}`, testo),
])
const GRATUITI_KEYS = new Set(GRATUITI_CELLS.map((b) => b._key))

{
  const page = await client.fetch(
    '*[_type == "page" && pageId == "formazione-finanziata"][0]{ _id, sections }'
  )
  if (!page?._id) {
    console.error('doc page formazione-finanziata non trovato')
    process.exit(1)
  }

  const sections = (page.sections ?? []).map((s) => {
    if (s.title?.it !== 'Gratuiti, ma non per tutti.') return s
    const blocks = (s.body?.it ?? []).filter((b) => !GRATUITI_KEYS.has(b._key))
    return { ...s, body: { ...s.body, it: [...blocks, ...GRATUITI_CELLS] } }
  })

  await client.patch(page._id).set({ sections }).commit()
  console.log(`✓ formazione-finanziata (${page._id})`)
  console.log('  "Gratuiti, ma non per tutti.": 4 celle (chi/come/cosa/quando)')
}

/* ———————— music-data-analyst-and-strategist ———————— */

{
  const course = await client.fetch(
    '*[_type == "course" && slug.current == "music-data-analyst-and-strategist"][0]{ _id, network }'
  )
  if (!course?._id) {
    console.error('corso music-data-analyst-and-strategist non trovato')
    process.exit(1)
  }

  const network = (course.network ?? []).map((n) =>
    n.text?.it?.includes('Panico Sghetto Records')
      ? {
          ...n,
          text: {
            ...n.text,
            it: n.text.it.replace('Panico Sghetto Records', 'Panico · Sghetto Records'),
          },
        }
      : n
  )

  await client.patch(course._id).set({ network }).commit()
  console.log(`✓ music-data-analyst-and-strategist (${course._id})`)
  console.log('  network: "Panico" e "Sghetto Records" separati')
  console.log(
    '  admissions (Come iscriversi / Documenti / Graduatoria / Età): NON aggiunte — nell\'HTML i testi sono segnaposto gialli'
  )
}
