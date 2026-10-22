/**
 * Aggiunge `common.deadline`: l'etichetta della riga "scadenza
 * candidature" fra i dati della hero della scheda corso (mockup
 * academy/urban-music-production.html).
 *
 * Uso: node scripts/patch-dict-course-deadline.mjs
 * Idempotente: scrive solo se la chiave manca, e rilegge il file a ogni
 * giro perché altri script lavorano sugli stessi dizionari.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const LABEL = { it: 'scadenza candidature', en: 'application deadline' }

for (const locale of ['it', 'en']) {
  const file = join(root, 'lib/i18n', `${locale}.json`)
  const dict = JSON.parse(readFileSync(file, 'utf8'))
  if (!dict.common) {
    console.log(`${locale}: common assente, salto`)
    continue
  }
  if (dict.common.deadline === LABEL[locale]) {
    console.log(`${locale}: già presente`)
    continue
  }
  /* subito dopo "inizio": nel file le etichette dei dati stanno in fila */
  const next = {}
  for (const [k, v] of Object.entries(dict.common)) {
    next[k] = v
    if (k === 'start') next.deadline = LABEL[locale]
  }
  if (!next.deadline) next.deadline = LABEL[locale]
  dict.common = next
  writeFileSync(file, `${JSON.stringify(dict, null, 2)}\n`)
  console.log(`${locale}: common.deadline aggiunta`)
}
