/* etichette del passo finale "si prenota sullo shop" del flusso affitto
   studio. Idempotente: rilegge i dizionari e scrive solo le chiavi
   mancanti (altre sessioni lavorano sugli stessi file). */
import { readFileSync, writeFileSync } from 'node:fs'

const ROOT = new URL('../lib/i18n/', import.meta.url)

const SHOP = {
  it: {
    shopTitle: 'Ci siamo: lo spazio ti aspetta.',
    shopText:
      'La prenotazione si chiude sulla scheda dello spazio, dove trovi tariffe, disponibilità e pagamento. Le scelte che hai fatto qui ti servono da promemoria.',
    shopCta: 'Vai allo spazio e prenota',
  },
  en: {
    shopTitle: 'All set: the space is waiting.',
    shopText:
      'Booking is completed on the space page, with rates, availability and payment. The choices you made here are your reminder.',
    shopCta: 'Go to the space and book',
  },
}

for (const lang of ['it', 'en']) {
  const file = new URL(`${lang}.json`, ROOT)
  const d = JSON.parse(readFileSync(file, 'utf8'))
  const flow = d?.studioSub?.affitto?.flow
  if (!flow) {
    console.log(lang, 'flow assente: niente da fare')
    continue
  }
  /* niente sovrascritture: solo le chiavi che mancano */
  for (const [k, v] of Object.entries(SHOP[lang])) {
    if (flow[k] === undefined) flow[k] = v
  }
  /* il wizard della prima stesura non serve più: il flusso vive in flow */
  delete d.studioSub.affitto.wizard
  writeFileSync(file, JSON.stringify(d, null, 2) + '\n')
  console.log(lang, 'ok')
}
