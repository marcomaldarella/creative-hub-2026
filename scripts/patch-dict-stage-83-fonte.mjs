/**
 * Note per lo sviluppatore — /academy/stage-placement (mockup v2).
 *
 * 1) L'83% torna nella fascia numeri, con la fonte. In una sessione
 *    precedente era stato tolto (patch-dict-academy-audit.mjs) perché nel
 *    mockup era evidenziato in giallo: il giallo però era sul promemoria
 *    interno «verificare base del dato», non sul dato. La nota dice
 *    esplicitamente che l'83% «resta in grande nei numeri, con la fonte»,
 *    quindi rientra fra i 20 studenti e i 27 anni, con la dicitura della
 *    fonte copiata alla lettera dal mockup. NON rientra nell'h1.
 * 2) Nome della sezione allineato: la card «tutto intorno allo studio»
 *    della landing academy si chiamava «Opportunità lavorative», il menu
 *    «Stage & placement». Vince la dicitura della pagina (menu, eyebrow,
 *    banner e titolo del mockup): la card si allinea al menu.
 * 3) metaTitle/metaDesc: valori esatti della nota (già allineati, lo
 *    script li tiene fermi).
 * 4) nav.home: etichetta della prima briciola del BreadcrumbList.
 *
 * Uso: node scripts/patch-dict-stage-83-fonte.mjs [--dry-run]
 * Idempotente: rilegge i file a ogni giro e scrive solo se qualcosa cambia.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

/* il numero con la fonte, dal mockup academy/stage-placement.html:
   <b>83%</b><span>degli studenti lavora nel settore. Dato certificato
   dalla Regione Emilia-Romagna</span> */
const COPY = {
  it: {
    point: '83% degli studenti lavora nel settore. Dato certificato dalla Regione Emilia-Romagna',
    cardTitle: 'Stage & placement',
    cardTitleOld: 'Opportunità lavorative',
    metaTitle: 'Stage e placement nella musica | Creative Hub Academy Bologna',
    metaDesc:
      "Stage in studi, club e produzioni, l'etichetta Label Lab con Orchard Italia, audizioni con agenzie di management. Dal primo anno.",
    home: 'Home',
  },
  en: {
    point: '83% of students work in the industry. Data certified by the Emilia-Romagna Region',
    cardTitle: 'Internships & placement',
    cardTitleOld: 'Career opportunities',
    metaTitle: 'Internships and placement in music | Creative Hub Academy Bologna',
    metaDesc:
      'Internships in studios, clubs and productions, the in-house Label Lab with Orchard Italia, auditions with management agencies. From year one.',
    home: 'Home',
  },
}

for (const locale of ['it', 'en']) {
  const file = join(root, 'lib', 'i18n', `${locale}.json`)
  /* rilettura a ogni giro: altri script lavorano sullo stesso file */
  const raw = readFileSync(file, 'utf8')
  const dict = JSON.parse(raw)
  const copy = COPY[locale]

  /* ————— 1. l'83% nella fascia numeri, in testa ————— */
  const topic = dict.topics?.stagePlacement
  if (!topic) {
    console.log(`[${locale}] topics.stagePlacement assente, salto`)
  } else {
    const points = Array.isArray(topic.points) ? topic.points : []
    /* ricerca per contenuto, non per indice: l'ordine può cambiare */
    const already = points.findIndex((p) => typeof p === 'string' && p.includes('83%'))
    if (already === -1) {
      topic.points = [copy.point, ...points]
      console.log(`[${locale}] + punto 83% in testa alla fascia numeri`)
    } else if (points[already] !== copy.point) {
      points[already] = copy.point
      console.log(`[${locale}] ~ punto 83% riallineato alla dicitura del mockup`)
    } else {
      console.log(`[${locale}] = punto 83% già allineato`)
    }

    /* ————— 3. title e meta esatti della nota ————— */
    for (const key of ['metaTitle', 'metaDesc']) {
      if (topic[key] === copy[key]) {
        console.log(`[${locale}] = topics.stagePlacement.${key} già esatto`)
      } else {
        topic[key] = copy[key]
        console.log(`[${locale}] ~ topics.stagePlacement.${key} riallineato alla nota`)
      }
    }
  }

  /* ————— 2. la card della landing academy prende il nome del menu ————— */
  const around = dict.academy?.aroundItems
  /* la card di stage-placement è la prima della fascia «tutto intorno allo
     studio» (AROUND in app/(site)/[locale]/academy/page.tsx); la cerco per
     titolo noto, così non dipendo solo dalla posizione */
  const card = Array.isArray(around)
    ? (around.find((it) => it?.title === copy.cardTitle || it?.title === copy.cardTitleOld) ??
      around[0])
    : undefined
  if (!card) {
    console.log(`[${locale}] academy.aroundItems assente, salto la card`)
  } else if (card.title === copy.cardTitle) {
    console.log(`[${locale}] = card academy già «${copy.cardTitle}»`)
  } else if (card.title === copy.cardTitleOld) {
    card.title = copy.cardTitle
    console.log(`[${locale}] ~ card academy: «${copy.cardTitleOld}» → «${copy.cardTitle}»`)
  } else {
    console.log(`[${locale}] ? card academy con titolo inatteso «${card.title}», non la tocco`)
  }

  /* ————— 4. etichetta della prima briciola ————— */
  if (dict.nav && dict.nav.home === undefined) {
    dict.nav.home = copy.home
    console.log(`[${locale}] + nav.home`)
  } else {
    console.log(`[${locale}] = nav.home già presente`)
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
