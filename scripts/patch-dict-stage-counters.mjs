/**
 * Stage & placement — i tre numeri della testata come contatori.
 *
 * Nel mockup (academy/stage-placement.html, blocco `.nums`) i numeri
 * sono tre cifre display enormi con sotto la riga di testo, e sotto
 * l'83% anche la fonte del dato:
 *
 *   83%  degli studenti lavora nel settore.
 *        Dato certificato dalla Regione Emilia-Romagna
 *   20   studenti al massimo per corso universitario: …
 *   27   anni di rapporti con studi, club ed etichette, dal 1999
 *
 * Nel dizionario i tre numeri stavano in `topics.stagePlacement.points`
 * come righe intere, e la pagina doveva spezzarle con una regex per
 * tirare fuori la cifra. Così la cifra non può diventare un contatore
 * animato (<Counter> vuole un numero vero) e la fonte non può avere un
 * peso tipografico suo.
 *
 * Questo script aggiunge `topics.stagePlacement.stats`: la cifra come
 * numero, il suffisso, la riga di testo e la fonte. `points` NON viene
 * toccato: resta la forma piatta, la usa la card di questo topic nella
 * landing academy.
 *
 * Tutti e tre i numeri portano le STESSE chiavi, con stringa vuota dove
 * non servono: il tipo `Dictionary` è `typeof it.json`, se le voci
 * avessero forme diverse l'array diventerebbe un'unione e leggere
 * `.source` non compilerebbe.
 *
 * Il promemoria redazionale giallo del mockup («verificare base del
 * dato») NON entra: è una nota interna, non si pubblica.
 *
 * Uso: node scripts/patch-dict-stage-counters.mjs [--dry-run]
 * Idempotente: rilegge il file a ogni giro (ci lavorano altri script) e
 * scrive solo se qualcosa cambia davvero.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

const COPY = {
  it: [
    {
      value: 83,
      suffix: '%',
      label: 'degli studenti lavora nel settore',
      source: 'Dato certificato dalla Regione Emilia-Romagna',
    },
    {
      value: 20,
      suffix: '',
      label:
        'studenti al massimo per corso universitario: ognuno ha un percorso seguito',
      source: '',
    },
    {
      value: 27,
      suffix: '',
      label: 'anni di rapporti con studi, club ed etichette, dal 1999',
      source: '',
    },
  ],
  en: [
    {
      value: 83,
      suffix: '%',
      label: 'of students work in the industry',
      source: 'Data certified by the Emilia-Romagna Region',
    },
    {
      value: 20,
      suffix: '',
      label: 'students at most per university course: each one follows a guided path',
      source: '',
    },
    {
      value: 27,
      suffix: '',
      label: 'years of relationships with studios, clubs and labels, since 1999',
      source: '',
    },
  ],
}

for (const locale of ['it', 'en']) {
  const file = join(root, 'lib', 'i18n', `${locale}.json`)
  /* rilettura a ogni giro: sullo stesso file lavorano altri script */
  const raw = readFileSync(file, 'utf8')
  const dict = JSON.parse(raw)

  const topic = dict.topics?.stagePlacement
  if (!topic) {
    console.log(`[${locale}] topics.stagePlacement assente, salto`)
    continue
  }

  const wanted = COPY[locale]
  if (JSON.stringify(topic.stats) === JSON.stringify(wanted)) {
    console.log(`[${locale}] = topics.stagePlacement.stats già allineato`)
  } else {
    topic.stats = wanted
    console.log(`[${locale}] ~ topics.stagePlacement.stats scritto (${wanted.length} numeri)`)
  }

  const next = `${JSON.stringify(dict, null, 2)}\n`
  if (next === raw) {
    console.log(`[${locale}] nessuna modifica da scrivere`)
    continue
  }
  if (dryRun) {
    console.log(`[${locale}] ~ dry-run: file non scritto`)
    continue
  }
  writeFileSync(file, next)
  console.log(`[${locale}] ✓ ${file} scritto`)
}
