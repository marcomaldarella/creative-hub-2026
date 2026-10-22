/**
 * Stage & placement: le due azioni della testata del mockup
 * (academy/stage-placement.html) — "Prenota l'open day" e "Leggi le
 * storie", che scende alla sezione delle persone.
 *
 * Uso: node scripts/patch-dict-stage-hero-ctas.mjs
 * Idempotente: rilegge il file e scrive solo se il valore è diverso.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const CTAS = {
  it: [
    { label: "Prenota l'open day", href: '/academy/open-day' },
    { label: 'Leggi le storie', href: '#storie' },
  ],
  en: [
    { label: 'Book the open day', href: '/academy/open-day' },
    { label: 'Read the stories', href: '#storie' },
  ],
}

for (const locale of ['it', 'en']) {
  const file = join(root, 'lib/i18n', `${locale}.json`)
  const dict = JSON.parse(readFileSync(file, 'utf8'))
  const topic = dict.topics?.stagePlacement
  if (!topic) {
    console.log(`${locale}: topics.stagePlacement assente, salto`)
    continue
  }
  if (JSON.stringify(topic.heroCtas) === JSON.stringify(CTAS[locale])) {
    console.log(`${locale}: già allineato`)
    continue
  }
  topic.heroCtas = CTAS[locale]
  writeFileSync(file, `${JSON.stringify(dict, null, 2)}\n`)
  console.log(`${locale}: heroCtas di stage-placement scritte`)
}
