#!/usr/bin/env node
/**
 * Colma i buchi dei dizionari trovati confrontando le pagine studio
 * con i mockup HTML del cliente (ott 2026).
 *
 * Tre voci che nei PDF non si vedevano, perché stavano in fisarmoniche
 * chiuse o in CTA che il PDF non rendeva:
 *   1. studios.heroCta            — la CTA dell'hero della landing
 *   2. registrazione.whereCta     — il rimando "Tutto lo studio" sotto
 *                                   "Dove registri."
 *   3. affitto.findExtra          — la sesta riga di "Cosa trovi in
 *                                   studio" (le altre cinque sono gli
 *                                   `space` di Sanity; questa è dotazione,
 *                                   non una stanza, quindi vive qui)
 *
 * Idempotente: RILEGGE i file a ogni esecuzione e scrive solo le chiavi
 * che mancano, senza toccare il resto (altri agenti lavorano sugli
 * stessi dizionari).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/* le chiavi nuove, per lingua: percorso puntato → valore */
const PATCH = {
  it: {
    'studios.heroCta': 'Parlaci del tuo progetto',
    'studioSub.registrazione.whereCta': 'Tutto lo studio',
    'studioSub.affitto.findExtra': [
      {
        title: 'Software e strumenti',
        text: 'Pro Tools, Ableton, Universal Audio.',
      },
    ],
  },
  en: {
    'studios.heroCta': 'Tell us about your project',
    'studioSub.registrazione.whereCta': 'The whole studio',
    'studioSub.affitto.findExtra': [
      {
        title: 'Software and instruments',
        text: 'Pro Tools, Ableton, Universal Audio.',
      },
    ],
  },
}

/* _key su ogni oggetto in array, come in Sanity: così le voci restano
   identificabili anche se un domani finiscono nel CMS */
const withKeys = (value, path) =>
  Array.isArray(value)
    ? value.map((item, i) =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? { _key: `${path.split('.').pop()}-${i + 1}`, ...item }
          : item
      )
    : value

let totale = 0

for (const [locale, voci] of Object.entries(PATCH)) {
  const file = resolve(root, 'lib/i18n', `${locale}.json`)
  /* rilettura a ogni giro: il file può essere cambiato sotto di noi */
  const dict = JSON.parse(readFileSync(file, 'utf8'))
  const aggiunte = []

  for (const [path, value] of Object.entries(voci)) {
    const parts = path.split('.')
    const leaf = parts.pop()
    let node = dict
    let mancante = false
    for (const p of parts) {
      if (node[p] == null || typeof node[p] !== 'object') {
        console.warn(`  ! ${locale}: manca il ramo ${parts.join('.')} — salto ${path}`)
        mancante = true
        break
      }
      node = node[p]
    }
    if (mancante) continue
    if (node[leaf] !== undefined) continue
    node[leaf] = withKeys(value, path)
    aggiunte.push(path)
  }

  if (aggiunte.length === 0) {
    console.log(`${locale}.json — già a posto, nessuna chiave da aggiungere`)
    continue
  }

  writeFileSync(file, `${JSON.stringify(dict, null, 2)}\n`, 'utf8')
  console.log(`${locale}.json — aggiunte ${aggiunte.length}:`)
  for (const a of aggiunte) console.log(`  + ${a}`)
  totale += aggiunte.length
}

console.log(totale === 0 ? '\nNiente da fare.' : `\nFatto: ${totale} chiavi scritte.`)
