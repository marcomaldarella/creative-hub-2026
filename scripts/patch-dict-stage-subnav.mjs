/**
 * Dizionari IT+EN per la pagina dedicata /academy/stage-placement
 * (route statica, mockup v2 academy/stage-placement.html).
 *
 * La pagina è costruita a mano sulla struttura del mockup e legge i
 * contenuti dal documento Sanity `page` con pageId `stage-placement`.
 * Dal dizionario le serve SOLO la chrome che in Sanity non esiste:
 * l'indice sticky (le etichette delle cinque sezioni + le due frecce di
 * salto). Titoli, occhielli e corpi restano in Sanity, editabili.
 *
 * Non tocca niente di quanto già scritto da patch-dict-stage-83-fonte.mjs
 * (l'83% nei numeri, metaTitle/metaDesc, nav.home): legge il file a ogni
 * giro e scrive solo la propria chiave.
 *
 * Uso: node scripts/patch-dict-stage-subnav.mjs [--dry-run]
 * Idempotente: confronta e scrive solo se qualcosa cambia.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

/* le cinque sezioni della pagina, nell'ordine del mockup. Le chiavi
   `items` sono le ANCORE delle sezioni Sanity (vedi
   patch-stage-placement-anchors.mjs): così l'indice resta appaiato alle
   sezioni anche se un domani cambiano di posto. */
const COPY = {
  it: {
    prev: 'sezione precedente',
    next: 'sezione successiva',
    items: {
      percorso: 'il percorso',
      storie: 'le storie',
      'label-lab': 'label lab',
      rete: 'la rete',
      domande: 'domande',
    },
  },
  en: {
    prev: 'previous section',
    next: 'next section',
    items: {
      percorso: 'the path',
      storie: 'the stories',
      'label-lab': 'label lab',
      rete: 'the network',
      domande: 'questions',
    },
  },
}

for (const locale of ['it', 'en']) {
  const file = join(root, 'lib', 'i18n', `${locale}.json`)
  /* rilettura a ogni giro: sullo stesso file lavorano altri script */
  const raw = readFileSync(file, 'utf8')
  const dict = JSON.parse(raw)
  const copy = COPY[locale]

  const topic = dict.topics?.stagePlacement
  if (!topic) {
    console.log(`[${locale}] topics.stagePlacement assente, salto`)
    continue
  }

  const wanted = { prev: copy.prev, next: copy.next, items: copy.items }
  if (JSON.stringify(topic.subnav) === JSON.stringify(wanted)) {
    console.log(`[${locale}] = topics.stagePlacement.subnav già allineato`)
  } else {
    topic.subnav = wanted
    console.log(`[${locale}] ~ topics.stagePlacement.subnav scritto`)
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
