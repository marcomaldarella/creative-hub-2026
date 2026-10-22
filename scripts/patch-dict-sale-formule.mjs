/* aggiunge sala didattica e area culture alle formule del riquadro
   prenota (prezzi veri dal catalogo). Idempotente. */
import { readFileSync, writeFileSync } from 'node:fs'
const ROOT = new URL('../lib/i18n/', import.meta.url)
const ADD = {
  it: [
    { row: ['Sala didattica', '159,50€', 'sala', 'corsi e workshop'], hint: 'per corsi e workshop' },
    { row: ['Area culture', '175€', 'spazio', 'eventi e incontri'], hint: 'per eventi e incontri' },
  ],
  en: [
    { row: ['Teaching room', '159,50€', 'room', 'courses and workshops'], hint: 'for courses and workshops' },
    { row: ['Culture area', '175€', 'space', 'events and meetings'], hint: 'for events and meetings' },
  ],
}
for (const lang of ['it', 'en']) {
  const f = new URL(`${lang}.json`, ROOT)
  const d = JSON.parse(readFileSync(f, 'utf8'))
  const c = d.coworking
  if (!c?.tableRows) { console.log(lang, 'coworking assente'); continue }
  for (const { row, hint } of ADD[lang]) {
    if (!c.tableRows.some((r) => r[0] === row[0])) {
      c.tableRows.push(row)
      c.bookHints.push(hint)
    }
  }
  writeFileSync(f, JSON.stringify(d, null, 2) + '\n')
  console.log(lang, 'formule:', c.tableRows.length)
}
