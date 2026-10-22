/**
 * Open day · domande dei genitori: toglie il claim "83% degli studenti
 * lavora nel settore" dalla risposta "Dopo, si lavora?".
 *
 * Nel mockup (academy/open-day.html) quel dato è marcato giallo con
 * "verificare": non si pubblica finché l'Academy non lo conferma. Al suo
 * posto resta il contenuto non marcato dello stesso mockup
 * (stage-placement: "Per molti lo stage diventa il primo contratto").
 *
 * Uso: node scripts/patch-dict-open-day-83.mjs
 * Idempotente: riscrive il valore atteso, rilanciarlo non cambia nulla.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const NEW = {
  it: 'Lo stage in azienda fa parte del corso e per molti diventa il primo contratto.',
  en: 'The work placement is part of the course, and for many it turns into their first contract.',
}

for (const locale of ['it', 'en']) {
  const file = join(root, 'lib/i18n', `${locale}.json`)
  /* rilettura a ogni giro: altri script lavorano sullo stesso file */
  const dict = JSON.parse(readFileSync(file, 'utf8'))
  const items = dict.openDay?.parents?.items
  if (!Array.isArray(items)) {
    console.log(`${locale}: openDay.parents.items assente, salto`)
    continue
  }
  /* la voce è quella che rimanda a stage & placement: la si trova dal
     contenuto, non dall'indice (l'ordine può cambiare) */
  const i = items.findIndex((it) => /83%/.test(it.a ?? ''))
  if (i === -1) {
    console.log(`${locale}: già bonificato`)
    continue
  }
  items[i].a = NEW[locale]
  writeFileSync(file, `${JSON.stringify(dict, null, 2)}\n`)
  console.log(`${locale}: risposta ${i + 1} aggiornata`)
}
