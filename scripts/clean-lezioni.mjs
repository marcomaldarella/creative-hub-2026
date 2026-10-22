/**
 * Bonifica dei 5 corsi custom "lezioni su misura" (import ott 2026) +
 * seed dei pacchetti prezzo sul canto.
 *
 * Bug di import corretti (confrontati coi mockup in
 * ~/Downloads/pagine-html 2/lezioni-su-misura/):
 *  - marker gialli "confermare …" pubblicati per errore nelle FAQ e
 *    nella struttura del canto (una FAQ era SOLO marker → eliminata);
 *  - kicker della card successiva accodate a structure[0]/[1]
 *    ("In sede · di gruppo", "Da casa · individuale", "In sede · in
 *    autonomia");
 *  - testo del bottone inglobato nell'ultimo admissions ("Prenota la
 *    lezione gratuita Senza impegno." / "… Ci vogliono 30 secondi.");
 *  - chip stili/software fusi senza spazi nell'ultima skill
 *    ("Stili: PopRockFunk…") → riscritti come elenco leggibile.
 *
 * Seed: SOLO su course-custom-canto i pacchetti reali del mockup
 * (prova 0€ / Smart 96€ / Standard 160€). Niente badge "Il più scelto"
 * e niente terms: nel mockup sono gialli, da verificare.
 *
 * Patcha pubblicato + eventuale draft. Uso:
 *   node scripts/clean-lezioni.mjs [--dry-run]
 * Idempotente: riscrive solo ciò che contiene ancora l'artefatto.
 */

import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
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

const dryRun = process.argv.includes('--dry-run')
const key = () => randomBytes(6).toString('hex')

/* code accodate dallo scraping: kicker delle card e testo del bottone */
const TAILS = [
  'In sede · di gruppo',
  'Da casa · individuale',
  'In sede · in autonomia',
  'Prenota la lezione gratuita Senza impegno.',
  'Prenota la lezione gratuita Ci vogliono 30 secondi.',
]

/* riscritture puntuali (chip fusi, marker gialli): _key → testo pulito.
   null = elimina l'intera voce */
const FIXES = {
  'course-custom-basso': {
    skills: {
      fd6568ca4689:
        'Ascolto, interplay e palco con altri musicisti. Stili: pop, rock, funk, soul, jazz, reggae, blues, R&B.',
    },
  },
  'course-custom-chitarra': {
    skills: {
      be28243913c0:
        'Tempo, ascolto, band e palco. Stili: rock, blues, funk, indie, alternative, neo-soul, jazz fusion, fingerstyle.',
    },
  },
  'course-custom-pianoforte': {
    skills: {
      '38abe46e436a':
        'Il primo brano in 2–3 mesi, poi un repertorio tutto tuo. Stili: pop, rock, funk, soul, blues, R&B, elettronica, jazz, colonne sonore.',
    },
  },
  'course-custom-produzione': {
    skills: {
      '10b14dfa5c09':
        'In media in circa 2 mesi, poi un catalogo tutto tuo. Software: Ableton Live, Logic Pro, Reaper, Pro Tools.',
    },
  },
  'course-custom-canto': {
    faq: {
      /* "Ci sono lezioni di canto per adulti?" — via "confermare età minima" */
      abbab7b0f39c:
        'Sì. Le lezioni sono costruite sul singolo studente e funzionano a qualsiasi età.',
      /* "Lavoro: a che ore si fanno le lezioni?" */
      ab814751c3fb:
        "Giorno e ora li concordi con il tuo insegnante e li gestisci dall'app di prenotazione.",
      /* "C'è un vincolo?" — la risposta era SOLO il marker: via tutta la voce */
      '03054b5e1743': null,
      /* "Come funzionano le lezioni di canto online?" */
      c6d83b3b0eae:
        'Fai lezione in videochiamata con gli stessi insegnanti della sede. Anche la prova gratuita può essere online.',
      /* "Serve saper leggere la musica?" */
      '2bad4814b41b':
        'No. La teoria arriva strada facendo, quando serve alla tua voce.',
    },
    structure: {
      '8734420eb41e':
        'Stessi insegnanti, stesso programma, da casa tua. Anche la prima lezione gratuita può essere online.',
    },
  },
}

const COURSES = [
  'course-custom-basso',
  'course-custom-canto',
  'course-custom-chitarra',
  'course-custom-pianoforte',
  'course-custom-produzione',
]

/* pacchetti reali dal mockup canto.html (solo canto: gli altri quattro
   nei mockup hanno "€ da definire" e restano senza packages) */
const ls = (it) => ({ _type: 'localeString', it })
const CANTO_PACKAGES = [
  {
    _key: key(),
    name: ls('Lezione di prova'),
    price: '0€',
    note: ls('In sede o online, senza impegno'),
    badge: ls('Si parte da qui'),
    plan: '',
    features: [
      { _key: key(), ...ls("Conosci l'insegnante") },
      { _key: key(), ...ls('Capiamo insieme il tuo livello') },
      { _key: key(), ...ls('Decidi dopo se continuare') },
    ],
  },
  {
    _key: key(),
    name: ls('Smart'),
    price: '96€',
    per: ls('/ mese'),
    unitNote: ls('circa 24€ a lezione'),
    note: ls('Per studiare con costanza'),
    plan: 'Smart',
    features: [
      { _key: key(), ...ls('1 lezione individuale a settimana') },
      { _key: key(), ...ls('Accesso alle sale studio') },
      { _key: key(), ...ls('App di prenotazione') },
    ],
  },
  {
    _key: key(),
    name: ls('Standard'),
    price: '160€',
    per: ls('/ mese'),
    unitNote: ls('circa 20€ a lezione, gruppo incluso'),
    note: ls("Tecnica più musica d'insieme"),
    plan: 'Standard',
    features: [
      { _key: key(), ...ls('1 lezione individuale a settimana') },
      { _key: key(), ...ls("1 lezione di musica d'insieme a settimana") },
      { _key: key(), ...ls('Accesso alle sale studio') },
      { _key: key(), ...ls('App di prenotazione') },
    ],
  },
]

/* toglie code accodate e, dopo, eventuali spazi residui */
function stripTails(text) {
  let out = text
  let changed = true
  while (changed) {
    changed = false
    for (const tail of TAILS) {
      if (out.endsWith(tail)) {
        out = out.slice(0, -tail.length).trimEnd()
        changed = true
      }
    }
  }
  return out
}

for (const baseId of COURSES) {
  const docs = await client.getDocuments([baseId, `drafts.${baseId}`])
  for (const doc of docs) {
    if (!doc) continue
    const patch = client.patch(doc._id)
    let dirty = false
    const log = (msg) => console.log(`→ ${doc._id}: ${msg}`)

    /* 1. code accodate su structure / admissions */
    for (const field of ['structure', 'admissions']) {
      for (const item of doc[field] ?? []) {
        const current = item.text?.it ?? ''
        const clean = stripTails(current)
        if (clean !== current) {
          log(`${field} ${item._key}\n   da: "${current}"\n   a:  "${clean}"`)
          patch.set({ [`${field}[_key=="${item._key}"].text.it`]: clean })
          dirty = true
        }
      }
    }

    /* 2. riscritture puntuali per _key (gialli, chip fusi) */
    const fixes = FIXES[baseId] ?? {}
    for (const [field, byKey] of Object.entries(fixes)) {
      for (const [k, clean] of Object.entries(byKey)) {
        const item = (doc[field] ?? []).find((f) => f._key === k)
        if (!item) {
          console.log(`∅ ${doc._id}: ${field} ${k} non trovata, salto`)
          continue
        }
        if (clean === null) {
          log(`${field} ${k} ELIMINATA ("${item.title?.it ?? ''}")`)
          patch.unset([`${field}[_key=="${k}"]`])
          dirty = true
          continue
        }
        const current = item.text?.it ?? ''
        if (current === clean) continue
        log(`${field} ${k}\n   da: "${current}"\n   a:  "${clean}"`)
        patch.set({ [`${field}[_key=="${k}"].text.it`]: clean })
        dirty = true
      }
    }

    /* 3. seed pacchetti (solo canto, solo se non già presenti) */
    if (baseId === 'course-custom-canto' && !(doc.packages ?? []).length) {
      log('seed packages (prova 0€ / Smart 96€ / Standard 160€)')
      patch.set({ packages: CANTO_PACKAGES })
      dirty = true
    }

    if (!dirty) {
      console.log(`= ${doc._id}: già pulito`)
      continue
    }
    if (dryRun) {
      console.log(`(dry-run) ${doc._id}: patch non inviata`)
      continue
    }
    await patch.commit()
    console.log(`✓ ${doc._id} aggiornato`)
  }
}

console.log('Fatto.')
