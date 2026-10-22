/**
 * Etichette dello slider insegnanti delle lezioni su misura (ott 2026,
 * mockup HTML "Il metodo": pillole coi nomi, contatore 01/0N, frecce
 * tonde e ritratto riproducibile).
 *
 * Aggiunge a `lesson` di it.json e en.json:
 *  - teachersNav.prev / .next → aria-label delle due frecce
 *  - teachersNav.group        → etichetta della fila di pillole
 *  - teachersNav.play         → aria-label del tasto play ({name})
 *
 * IDEMPOTENTE: rilegge i file a ogni esecuzione e scrive SOLO le chiavi
 * assenti — i testi già presenti non vengono mai sovrascritti.
 *
 * Uso: node scripts/patch-dict-lezioni-slider.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

const IT = {
  lesson: {
    teachersNav: {
      prev: 'insegnante precedente',
      next: 'insegnante successivo',
      group: 'scegli un insegnante',
      play: 'guarda il video di {name}',
    },
  },
}

const EN = {
  lesson: {
    teachersNav: {
      prev: 'previous teacher',
      next: 'next teacher',
      group: 'choose a teacher',
      play: 'play the video of {name}',
    },
  },
}

const isPlain = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

/* scrive solo le chiavi assenti (o rimaste stringa vuota, cioè mai
   compilate): nessun testo già tradotto viene mai sovrascritto */
function addMissing(target, patch, path, added) {
  for (const [key, value] of Object.entries(patch)) {
    const here = path ? `${path}.${key}` : key
    const absent = !(key in target) || target[key] === ''
    if (absent && target[key] !== value) {
      target[key] = value
      added.push(here)
      continue
    }
    if (isPlain(target[key]) && isPlain(value)) {
      addMissing(target[key], value, here, added)
    }
  }
}

for (const [file, patch] of [
  ['it.json', IT],
  ['en.json', EN],
]) {
  const path = join(root, 'lib/i18n', file)
  /* rilettura a ogni esecuzione: le altre sessioni toccano lo stesso file */
  const dict = JSON.parse(readFileSync(path, 'utf8'))
  const added = []
  addMissing(dict, patch, '', added)
  if (added.length && !dryRun) {
    writeFileSync(path, `${JSON.stringify(dict, null, 2)}\n`)
  }
  console.log(
    `${file}: ${added.length} chiavi aggiunte${dryRun ? ' (dry run)' : ''}`
  )
  for (const key of added) console.log(`  + ${key}`)
}
