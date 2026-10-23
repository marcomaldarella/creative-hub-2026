/* titolo della pagina sound design: a capo dopo la & commerciale. */
import { readFileSync, writeFileSync } from 'node:fs'
const ROOT = new URL('../lib/i18n/', import.meta.url)
const T = {
  it: 'Sound design &\npost-produzione.',
  en: 'Sound design &\npost-production.',
}
for (const lang of ['it', 'en']) {
  const f = new URL(`${lang}.json`, ROOT)
  const d = JSON.parse(readFileSync(f, 'utf8'))
  if (d?.studioSub?.soundDesign) {
    d.studioSub.soundDesign.title = T[lang]
    writeFileSync(f, JSON.stringify(d, null, 2) + '\n')
    console.log(lang, '→', JSON.stringify(T[lang]))
  }
}
