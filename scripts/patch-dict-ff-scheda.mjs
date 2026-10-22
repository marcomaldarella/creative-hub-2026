/**
 * Aggiunge al dizionario le etichette della SCHEDA dei corsi finanziati,
 * lette dal mockup del cliente (music-data-analyst-and-strategist.html):
 * il sottomenu a cinque voci (panoramica / cosa impari / requisiti /
 * selezione / iscrizione), i titoli delle due fisarmoniche separate
 * ("Chi può partecipare." e "Iscrizione."), il fatto "gratuito" della
 * testata e la CTA "Avvisami alla prossima edizione".
 *
 * Uso: node scripts/patch-dict-ff-scheda.mjs
 * Rilegge i file a ogni giro e scrive solo le chiavi mancanti: altri
 * agenti lavorano sugli stessi dizionari, nulla viene sovrascritto.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/* le due lingue sono speculari: stesse chiavi, stesso ordine */
const SCHEDA = {
  it: {
    heroCta: 'Avvisami alla prossima edizione',
    costLabel: 'costo',
    costValue: 'Gratuito — finanziato da Regione Emilia-Romagna e FSE+',
    skillsTitle: 'Cosa impari.',
    admissionsTitle: 'Chi può partecipare.',
    enrollmentTitle: 'Iscrizione.',
    nav: {
      overview: 'Panoramica',
      skills: 'Cosa impari',
      requirements: 'Requisiti',
      selection: 'Selezione',
      enrollment: 'Iscrizione',
    },
  },
  en: {
    heroCta: 'Tell me about the next edition',
    costLabel: 'cost',
    costValue: 'Free — funded by the Emilia-Romagna Region and ESF+',
    skillsTitle: 'What you learn.',
    admissionsTitle: 'Who can take part.',
    enrollmentTitle: 'Enrolment.',
    nav: {
      overview: 'Overview',
      skills: 'What you learn',
      requirements: 'Requirements',
      selection: 'Selection',
      enrollment: 'Enrolment',
    },
  },
}

/* scrive solo ciò che manca, in profondità: le chiavi già presenti
   (magari toccate da un altro agente) restano come sono */
function fill(target, source) {
  let changed = 0
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {}
      changed += fill(target[key], value)
    } else if (target[key] === undefined) {
      target[key] = value
      changed += 1
    }
  }
  return changed
}

for (const locale of ['it', 'en']) {
  const file = join(root, 'lib/i18n', `${locale}.json`)
  const dict = JSON.parse(readFileSync(file, 'utf8'))
  if (!dict.finanziata) dict.finanziata = {}
  if (!dict.finanziata.scheda) dict.finanziata.scheda = {}
  const changed = fill(dict.finanziata.scheda, SCHEDA[locale])
  if (changed) writeFileSync(file, `${JSON.stringify(dict, null, 2)}\n`)
  console.log(`${locale}.json: ${changed} chiavi aggiunte in finanziata.scheda`)
}
