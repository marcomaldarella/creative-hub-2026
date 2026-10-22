/* etichette del passo finale "si prenota sullo shop" del flusso
   coworking. Idempotente: rilegge i dizionari, scrive solo se manca. */
import { readFileSync, writeFileSync } from 'node:fs'
const ROOT = new URL('../lib/i18n/', import.meta.url)
const T = {
  it: {
    shopTitle: 'Ci siamo: lo spazio ti aspetta.',
    shopText:
      'La prenotazione si chiude sulla scheda dello spazio, dove trovi disponibilità e pagamento. Le scelte che hai fatto qui ti servono da promemoria.',
    shopCta: 'Vai allo spazio e prenota',
  },
  en: {
    shopTitle: 'All set: the space is waiting.',
    shopText:
      'Booking is completed on the space page, with availability and payment. The choices you made here are your reminder.',
    shopCta: 'Go to the space and book',
  },
}
for (const lang of ['it', 'en']) {
  const file = new URL(`${lang}.json`, ROOT)
  const d = JSON.parse(readFileSync(file, 'utf8'))
  const flow = d?.prenota?.flow
  if (!flow) { console.log(lang, 'flow assente'); continue }
  for (const [k, v] of Object.entries(T[lang])) if (flow[k] === undefined) flow[k] = v
  writeFileSync(file, JSON.stringify(d, null, 2) + '\n')
  console.log(lang, 'ok')
}
