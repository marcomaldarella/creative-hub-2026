/**
 * Modifiche ACADEMY dal docx del 23/11 — parte Sanity (idempotente):
 *
 * 1. FAQ delle schede corso (campo `faq`, sezione "Scheda corso"):
 *    - urban-music-production: le 6 FAQ del template, con la risposta
 *      "studio" sostituita dal testo del cliente e Master of Music →
 *      Master Degree;
 *    - popular-music-performance-songwriting + creative-musicianship:
 *      prima FAQ del cliente (livello di strumento) + adattamento
 *      performance;
 *    - music-business: prima FAQ del cliente (economia/marketing);
 *    - i due master: FAQ che distingue l'alto perfezionamento dalla
 *      didattica da Bachelor.
 * 2. Docenti collegati ai corsi (sezione docenti della scheda: il
 *    template pubblica i primi 4 con ruolo o bio):
 *    - creative-musicianship: via Madonia e Bergonzoni (non insegna sui
 *      corsi universitari), in testa Galli / Martin / Banfi / Ciampolini;
 *    - music-business: in testa Grilli / Le Metre / Golfieri;
 *    - urban-music-production: collegati i docenti di produzione.
 * 3. Summary dei due master: alto perfezionamento, tutor, progetti
 *    competitivi da presentare al mercato.
 *
 * Uso: node scripts/seed-faq-docenti.mjs [--dry-run]
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@sanity/client'

const dry = process.argv.includes('--dry-run')
/* il token in .env.local è in sola lettura: per scrivere serve quello
   del CLI (come gli altri seed del repo) */
const cliToken = () => {
  try {
    return JSON.parse(
      readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8')
    ).authToken
  } catch {
    return undefined
  }
}
const client = createClient({
  projectId: 'if3942oc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: cliToken() ?? process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const key = (s) => `k-${s.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
const entry = (slug, i, qIt, qEn, aIt, aEn) => ({
  _key: key(`${slug}-faq-${i}`),
  title: { _type: 'localeString', it: qIt, en: qEn },
  text: { _type: 'localeText', it: aIt, en: aEn },
})
const ref = (id) => ({ _type: 'reference', _ref: id, _key: key(id) })

/* ————— FAQ condivise ————— */

const TITOLO = (slug, i) =>
  entry(
    slug,
    i,
    'Che titolo ottengo alla fine? È riconosciuto?',
    'What qualification do I get? Is it recognised?',
    'Un Bachelor of Arts (Hons) Level 6, titolo universitario internazionale — non un attestato di partecipazione. Puoi proseguire con un Master Degree al Creative Hub o all’estero.',
    'A Bachelor of Arts (Hons) Level 6, an internationally recognised university qualification — not a certificate of attendance. You can continue with a Master Degree at Creative Hub or abroad.'
  )

const VISITA = (slug, i) =>
  entry(
    slug,
    i,
    'Posso vedere la scuola prima di candidarmi?',
    'Can I visit the school before applying?',
    'Sì. Puoi venire a un open day, prenotare un tour dello studio o fare un workshop di prova. Puoi partecipare anche con i tuoi genitori.',
    'Yes. You can come to an open day, book a studio tour or try a taster workshop. You are welcome to bring your parents along.'
  )

/* prima FAQ chiesta dal cliente per i corsi performance */
const LIVELLO = (slug) =>
  entry(
    slug,
    1,
    'Che livello di strumento mi occorre per accedere ai corsi?',
    'What level do I need on my instrument to join the courses?',
    'Occorre una conoscenza base dello strumento o del canto per riuscire a dare il massimo nell’esperienza universitaria. Il tutor in sede di colloquio potrà consigliarti anche su eventuali percorsi di recupero crediti o preaccademici.',
    'You need a basic command of your instrument or voice to get the most out of the degree experience. At the interview, your tutor can also advise you on credit-recovery or pre-academic pathways.'
  )

const FAQ = {
  'urban-music-production': [
    entry(
      'urban-music-production',
      1,
      'Serve saper suonare uno strumento per fare beatmaking?',
      'Do I need to play an instrument to make beats?',
      'No. Il corso parte da come funziona un beat, non dal solfeggio: la teoria arriva applicata su Ableton. Se suoni già, meglio; se no, non è un requisito.',
      'No. The course starts from how a beat works, not from music theory drills: theory arrives applied, inside Ableton. If you already play, great; if not, it is not a requirement.'
    ),
    TITOLO('urban-music-production', 2),
    entry(
      'urban-music-production',
      3,
      'Quanto tempo passo in studio di registrazione?',
      'How much time do I spend in the recording studio?',
      /* testo del cliente, docx 23/11 */
      'Fin dal primo anno entri in studio di registrazione e lavori nelle aule di produzione. Dal secondo anno la regia SSL diventa il tuo spazio abituale per registrazione, mix e mastering dei tuoi brani. Il beatmaking lo impari in studio, non sulle slide.',
      'From the very first year you work in the recording studio and in the production rooms. From the second year the SSL control room becomes your regular space for recording, mixing and mastering your tracks. You learn beatmaking in the studio, not on slides.'
    ),
    entry(
      'urban-music-production',
      4,
      'Che software e che macchine si usano?',
      'What software and gear do you use?',
      'Ableton Live, Pro Tools e FL Studio, più sintetizzatori hardware, drum machine e i plugin degli studi professionali. Le stesse macchine che troverai lavorando.',
      'Ableton Live, Pro Tools and FL Studio, plus hardware synths, drum machines and the plugins used in professional studios. The same gear you will find at work.'
    ),
    VISITA('urban-music-production', 5),
    entry(
      'urban-music-production',
      6,
      'Che lavoro posso fare dopo il corso?',
      'What can I do after the course?',
      'Producer, beatmaker, sound designer, tecnico di studio, DJ: esci con un portfolio di brani pubblicati e i contatti del network — etichette, studi e artisti con cui hai già lavorato durante il triennio.',
      'Producer, beatmaker, sound designer, studio engineer, DJ: you graduate with a portfolio of released tracks and the network’s contacts — labels, studios and artists you have already worked with during the degree.'
    ),
  ],
}

/* FAQ performance: per popular-music-performance-songwriting e
   creative-musicianship (richiesta esplicita del docx) */
for (const slug of [
  'popular-music-performance-songwriting',
  'creative-musicianship',
]) {
  FAQ[slug] = [
    LIVELLO(slug),
    TITOLO(slug, 2),
    entry(
      slug,
      3,
      'Quanto tempo passo sul palco e in studio?',
      'How much time do I spend on stage and in the studio?',
      'Laboratori d’insieme e sala live fanno parte del percorso fin dal primo anno, e i tuoi brani passano dallo studio di registrazione: arrivi alla fine del triennio con repertorio, registrazioni ed esperienza di palco.',
      'Ensemble labs and the live room are part of the course from year one, and your songs go through the recording studio: you finish the degree with a repertoire, recordings and real stage experience.'
    ),
    VISITA(slug, 4),
    entry(
      slug,
      5,
      'Che lavoro posso fare dopo il corso?',
      'What can I do after the course?',
      'Cantante, session musician, performer live, autore: esci con repertorio, registrazioni e i contatti del network — etichette, studi e artisti con cui hai già lavorato durante il triennio.',
      'Singer, session musician, live performer, songwriter: you graduate with a repertoire, recordings and the network’s contacts — labels, studios and artists you have already worked with during the degree.'
    ),
  ]
}

FAQ['music-business'] = [
  entry(
    'music-business',
    1,
    'Occorre avere già nozioni di Economia o Marketing?',
    'Do I need a background in Economics or Marketing?',
    /* testo del cliente, docx 23/11 ("i docenti partiranno da zero") */
    'Non occorre. I docenti partiranno da zero, costruendo gli strumenti di economia e marketing direttamente su casi reali dell’industria musicale.',
    'No. Teachers start from scratch, building the economics and marketing toolkit directly on real cases from the music industry.'
  ),
  TITOLO('music-business', 2),
  VISITA('music-business', 3),
  entry(
    'music-business',
    4,
    'Che lavoro posso fare dopo il corso?',
    'What can I do after the course?',
    'Label manager, publishing, booking, management, marketing e comunicazione musicale: esci con progetti sviluppati su casi reali e i contatti del network dell’industria.',
    'Label manager, publishing, booking, artist management, music marketing and communication: you graduate with projects built on real cases and the industry network’s contacts.'
  ),
]

/* master: distinguerli dalla didattica da Bachelor (indicazione docx) */
const MASTER_FAQ = (slug) => [
  entry(
    slug,
    1,
    'In cosa un Master è diverso dal triennio?',
    'How is a Master different from the Bachelor?',
    'È un corso di alto perfezionamento: niente didattica frontale da triennio, ma progetti professionali e competitivi da presentare al mercato, con tutor che ti seguono passo a passo.',
    'It is an advanced-level programme: no Bachelor-style frontal teaching, but professional, competitive projects to bring to the market, with tutors following you step by step.'
  ),
  entry(
    slug,
    2,
    'Che titolo ottengo alla fine? È riconosciuto?',
    'What qualification do I get? Is it recognised?',
    'Un Master Degree, titolo universitario internazionale di secondo livello.',
    'A Master Degree, an internationally recognised postgraduate qualification.'
  ),
]
FAQ['professional-production-sound-design'] = MASTER_FAQ(
  'professional-production-sound-design'
)
FAQ['professional-arrangement-composition'] = MASTER_FAQ(
  'professional-arrangement-composition'
)

/* ————— docenti: ordine nuovo per corso (slug → _id teacher) ————— */

const TEACHERS = {
  /* via Madonia e Bergonzoni; in testa le quattro indicate dal cliente */
  'creative-musicianship': {
    head: [
      'teacher-daniela-galli',
      'teacher-stefania-martin',
      'teacher-gaia-banfi',
      'teacher-ilaria-ciampolini',
    ],
    drop: ['teacher-angela-madonia', 'teacher-alberto-bergonzoni'],
  },
  'music-business': {
    head: [
      'teacher-flavio-grilli',
      'teacher-gianmaria-le-metre',
      'teacher-giacomo-golfieri',
    ],
    drop: [],
  },
  'urban-music-production': {
    head: [
      'teacher-michele-suzzi',
      'teacher-cristiano-santini',
      'teacher-luca-jacoboni',
      'teacher-andrea-tinti',
      'teacher-matteo-caselli',
      'teacher-matteo-cavallari',
      'teacher-elena-antoni',
    ],
    drop: [],
  },
}

/* ————— summary dei master (alto perfezionamento) ————— */

const SUMMARY = {
  'professional-production-sound-design': {
    it: 'Master di alto perfezionamento in produzione e sound design: progetti professionali e competitivi da presentare al mercato, con tutor che ti seguono passo a passo e la strumentazione dello studio.',
    en: 'Advanced master in production and sound design: professional, competitive projects to bring to the market, with tutors following you step by step and the studio’s equipment.',
  },
  'professional-arrangement-composition': {
    it: 'Master di alto perfezionamento in arrangiamento e composizione — per disco, scena e immagine: progetti professionali da presentare al mercato, con tutor che ti seguono passo a passo.',
    en: 'Advanced master in arrangement and composition — for records, stage and screen: professional projects to bring to the market, with tutors following you step by step.',
  },
}

/* ————— run ————— */

const slugs = Object.keys(FAQ)
const courses = await client.fetch(
  `*[_type=='course' && slug.current in $slugs]{_id,'slug':slug.current,teachers}`,
  { slugs }
)

for (const c of courses) {
  const patch = { faq: FAQ[c.slug] }

  const t = TEACHERS[c.slug]
  if (t) {
    const current = (c.teachers ?? []).map((r) => r._ref)
    const rest = current.filter(
      (id) => !t.head.includes(id) && !t.drop.includes(id)
    )
    patch.teachers = [...t.head, ...rest].map(ref)
  }

  if (SUMMARY[c.slug]) {
    patch.summary = { _type: 'localeString', ...SUMMARY[c.slug] }
  }

  if (dry) {
    console.log(`[dry] ${c.slug} (${c._id}):`, Object.keys(patch).join(', '))
    if (patch.teachers)
      console.log('      teachers →', patch.teachers.map((r) => r._ref).join(', '))
    continue
  }
  await client.patch(c._id).set(patch).commit()
  console.log(`✔ ${c.slug}: ${Object.keys(patch).join(', ')}`)
}

console.log(dry ? 'dry-run completo' : 'fatto')
