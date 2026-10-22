/* etichetta del tasto in fondo alle card corso. Idempotente. */
import { readFileSync, writeFileSync } from 'node:fs'
const ROOT = new URL('../lib/i18n/', import.meta.url)
const T = { it: 'scopri il corso', en: 'discover the course' }
for (const lang of ['it', 'en']) {
  const f = new URL(`${lang}.json`, ROOT)
  const d = JSON.parse(readFileSync(f, 'utf8'))
  d.academy ??= {}
  if (d.academy.cardCta === undefined) d.academy.cardCta = T[lang]
  writeFileSync(f, JSON.stringify(d, null, 2) + '\n')
  console.log(lang, 'ok')
}
