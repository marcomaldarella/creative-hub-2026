/**
 * Audit mockup-vs-live delle pagine academy (ott 2026), lato dizionari.
 *
 *  - uni.stories.items: via i tre segnaposto ("Testimonianza in arrivo
 *    — Nome Cognome"). L'elenco resta vuoto e la sezione storie non si
 *    pubblica finché il cliente non manda frasi e nomi veri.
 *  - uni.numbers.stats: via l'83%. Nel mockup di stage-placement lo
 *    stesso dato è flaggato giallo "verificare base del dato": resta
 *    fuori finché la fonte non è confermata. La fascia regge con tre
 *    voci invece di quattro.
 *  - topics.stagePlacement.points: stessa cosa nella fascia numeri
 *    della pagina stage, restano i 20 studenti e i 27 anni.
 *  - topics.stagePlacement (en): l'h1 inglese conteneva ancora "83%
 *    work in the industry" — allineato all'italiano, come da nota H1
 *    del mockup.
 *  - topics.<topic>.metaTitle / metaDesc: title e description scritti
 *    per la ricerca (riga "Title / meta" dei mockup), letti dalla
 *    generateMetadata della route [slug] solo se presenti.
 *
 * Uso: node scripts/patch-dict-academy-audit.mjs [--dry-run]
 * Idempotente e cooperativo: rilegge i file al momento, tocca solo le
 * proprie chiavi, non riscrive mai da una copia in memoria.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

/* i testi per la ricerca, dalla riga "Title / meta" dei due mockup */
const META = {
  it: {
    stagePlacement: {
      metaTitle: 'Stage e placement nella musica | Creative Hub Academy Bologna',
      metaDesc:
        "Stage in studi, club e produzioni, l'etichetta Label Lab con Orchard Italia, audizioni con agenzie di management. Dal primo anno.",
    },
    serviziStudenti: {
      metaTitle:
        'Servizi studenti: borse di studio, Erasmus+, alloggio | Creative Hub Academy',
      metaDesc:
        'Borse di studio di merito, rate a tasso zero, tirocini Erasmus+, alloggio a Bologna, tutor e supporto DSA.',
    },
  },
  en: {
    stagePlacement: {
      metaTitle:
        'Internships and placement in music | Creative Hub Academy Bologna',
      metaDesc:
        'Internships in studios, clubs and productions, the in-house Label Lab with Orchard Italia, auditions with management agencies. From year one.',
    },
    serviziStudenti: {
      metaTitle:
        'Student services: scholarships, Erasmus+, housing | Creative Hub Academy',
      metaDesc:
        'Merit scholarships, interest-free instalments, Erasmus+ traineeships, housing in Bologna, tutoring and support for specific learning differences.',
    },
  },
}

/* l'h1 inglese di stage-placement, allineato all'italiano */
const EN_STAGE = {
  title: 'Internships and work in music.\nDuring the course, not after.',
  lede: "Internships in studios, clubs and productions. An in-house label distributed by Orchard Italia. Auditions with management agencies. From year one.",
}

const isPlaceholder = (s) =>
  /in arrivo|coming soon/i.test(s?.quote ?? '') ||
  /^(nome cognome|name surname)$/i.test(s?.who ?? '')

const hasEightyThree = (s) => typeof s === 'string' && s.includes('83%')

for (const locale of ['it', 'en']) {
  const file = join(root, 'lib/i18n', `${locale}.json`)
  const raw = readFileSync(file, 'utf8')
  const d = JSON.parse(raw)
  const done = []

  /* storie corsi universitari: fuori i segnaposto */
  const stories = d.uni?.stories?.items
  if (Array.isArray(stories) && stories.length > 0 && stories.every(isPlaceholder)) {
    d.uni.stories.items = []
    done.push(`uni.stories.items: ${stories.length} segnaposto rimossi`)
  }

  /* fascia numeri corsi universitari: fuori l'83% */
  const stats = d.uni?.numbers?.stats
  if (Array.isArray(stats)) {
    const keep = stats.filter((s) => !hasEightyThree(s?.n))
    if (keep.length !== stats.length) {
      d.uni.numbers.stats = keep
      done.push(`uni.numbers.stats: 83% rimosso (${keep.length} voci)`)
    }
  }

  /* fascia numeri stage & placement: fuori l'83% */
  const points = d.topics?.stagePlacement?.points
  if (Array.isArray(points)) {
    const keep = points.filter((p) => !hasEightyThree(p))
    if (keep.length !== points.length) {
      d.topics.stagePlacement.points = keep
      done.push(`topics.stagePlacement.points: 83% rimosso (${keep.length} voci)`)
    }
  }

  /* h1 e lede inglesi di stage & placement, senza il claim da verificare */
  if (locale === 'en' && hasEightyThree(d.topics?.stagePlacement?.title)) {
    d.topics.stagePlacement.title = EN_STAGE.title
    d.topics.stagePlacement.lede = EN_STAGE.lede
    done.push('topics.stagePlacement.title/lede (en): 83% fuori dall’h1')
  }

  /* title e description per la ricerca, solo se non ci sono già */
  for (const [topic, meta] of Object.entries(META[locale])) {
    const node = d.topics?.[topic]
    if (!node) continue
    for (const [key, value] of Object.entries(meta)) {
      if (node[key] === undefined) {
        node[key] = value
        done.push(`topics.${topic}.${key}`)
      }
    }
  }

  const next = `${JSON.stringify(d, null, 2)}\n`
  if (next === raw) {
    console.log(`= ${locale}.json: già allineato`)
    continue
  }
  if (!dryRun) writeFileSync(file, next)
  console.log(`${dryRun ? '~' : '✓'} ${locale}.json`)
  for (const line of done) console.log(`   ${line}`)
}
