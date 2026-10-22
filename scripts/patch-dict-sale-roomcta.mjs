/* etichetta del rimando dal configuratore eventi alla scheda della sala
   sullo shop. Idempotente: rilegge i dizionari e scrive solo se manca. */
import { readFileSync, writeFileSync } from 'node:fs'
const ROOT = new URL('../lib/i18n/', import.meta.url)
const CTA = { it: 'vedi la sala e prenota', en: 'see the room and book' }
for (const lang of ['it', 'en']) {
  const file = new URL(`${lang}.json`, ROOT)
  const d = JSON.parse(readFileSync(file, 'utf8'))
  const b = d?.saleEventiPage?.builder ?? d?.saleEventiPage
  if (!b || !b.types) { console.log(lang, 'builder assente'); continue }
  if (b.roomCta === undefined) b.roomCta = CTA[lang]
  writeFileSync(file, JSON.stringify(d, null, 2) + '\n')
  console.log(lang, 'ok')
}
