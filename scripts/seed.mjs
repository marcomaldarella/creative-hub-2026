/**
 * Seed demo per creative hub bologna.
 * Uso: node scripts/seed.mjs
 * Legge SANITY_API_TOKEN (e project id/dataset) da .env.local — nessuna dipendenza dotenv.
 * Idempotente: usa createOrReplace con _id deterministici.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import crypto from 'node:crypto'
import { createClient } from '@sanity/client'

/* ---------- env ---------- */

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = {}
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
}

const token = env.SANITY_API_TOKEN
if (!token) {
  console.error('SANITY_API_TOKEN mancante in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder',
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2026-07-01',
  token,
  useCdn: false,
})

/* ---------- helper ---------- */

const key = () => crypto.randomBytes(6).toString('hex')

/** blocco portable text con _key su blocco e span */
const block = (text) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

const blocks = (...texts) => texts.map((t) => block(t))

const ls = (it, en) => (en ? { it, en } : { it })

const ref = (id) => ({ _type: 'reference', _ref: id })
const refK = (id) => ({ _type: 'reference', _ref: id, _key: key() })

const slug = (current) => ({ _type: 'slug', current })

/* ---------- documenti ---------- */

const docs = []

/* --- siteSettings (singleton) --- */

docs.push({
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'creative hub bologna',
  shopUrl: 'https://shop.bologna-creativehub.it',
  address: 'via del tappezziere 4, 40138 bologna',
  phone: '+39 051 000 0000',
  email: 'info@bologna-creativehub.it',
  social: [
    { _type: 'socialLink', _key: key(), label: 'instagram', url: 'https://instagram.com/bolognacreativehub' },
    { _type: 'socialLink', _key: key(), label: 'youtube', url: 'https://youtube.com/@bolognacreativehub' },
    { _type: 'socialLink', _key: key(), label: 'linkedin', url: 'https://linkedin.com/company/bolognacreativehub' },
  ],
  openDay: {
    date: '2026-05-23T14:00:00+02:00',
    title: ls('open day — sabato 23 maggio, ore 14', 'open day — saturday may 23, 2pm'),
    ctaUrl: 'https://shop.bologna-creativehub.it/open-day',
  },
})

/* --- categorie corsi --- */

const courseCategories = [
  { id: 'courseCategory-musica', it: 'Musica', en: 'Music', slugValue: 'musica' },
  { id: 'courseCategory-suono', it: 'Suono', en: 'Sound', slugValue: 'suono' },
  { id: 'courseCategory-multimedia', it: 'Multimedia', en: 'Multimedia', slugValue: 'multimedia' },
  { id: 'courseCategory-visual', it: 'Visual', en: 'Visual', slugValue: 'visual' },
]

for (const c of courseCategories) {
  docs.push({
    _id: c.id,
    _type: 'courseCategory',
    title: ls(c.it, c.en),
    slug: slug(c.slugValue),
  })
}

/* --- docenti --- */

const teachers = [
  {
    id: 'teacher-marta-ferri',
    name: 'Marta Ferri',
    slugValue: 'marta-ferri',
    role: ls('Docente di produzione musicale', 'Music production lecturer'),
    bio: ls(
      'Producer e sound designer, ha lavorato per etichette indipendenti europee e per il cinema. Dal 2015 insegna produzione elettronica con un approccio orientato al progetto.',
      'Producer and sound designer working with European independent labels and film. Teaches project-based electronic production since 2015.'
    ),
  },
  {
    id: 'teacher-luca-bianchi',
    name: 'Luca Bianchi',
    slugValue: 'luca-bianchi',
    role: ls('Fonico e docente di sound engineering', 'Sound engineer and lecturer'),
    bio: ls(
      'Fonico di studio con vent’anni di sessioni tra Bologna e Londra. Specializzato in registrazione di ensemble acustici e workflow ibridi analogico-digitali.',
      'Studio engineer with twenty years of sessions between Bologna and London, focused on acoustic ensembles and hybrid workflows.'
    ),
  },
  {
    id: 'teacher-sara-conti',
    name: 'Sara Conti',
    slugValue: 'sara-conti',
    role: ls('Mastering engineer', 'Mastering engineer'),
    bio: ls(
      'Ha masterizzato oltre quattrocento release tra vinile e streaming. Cura il modulo di mastering e ascolto critico dell’academy.',
      'Has mastered over four hundred releases across vinyl and streaming. Leads the mastering and critical listening module.'
    ),
  },
  {
    id: 'teacher-davide-ricci',
    name: 'Davide Ricci',
    slugValue: 'davide-ricci',
    role: ls('Creative coder e media artist', 'Creative coder and media artist'),
    bio: ls(
      'Sviluppa installazioni interattive per musei e festival. Insegna creative coding, realtime graphics e progettazione di esperienze interattive.',
      'Builds interactive installations for museums and festivals. Teaches creative coding, realtime graphics and interaction design.'
    ),
  },
  {
    id: 'teacher-elena-moretti',
    name: 'Elena Moretti',
    slugValue: 'elena-moretti',
    role: ls('Graphic designer', 'Graphic designer'),
    bio: ls(
      'Art director indipendente, ha firmato identità visive per festival musicali e case editrici. Guida il percorso di brand identity e tipografia.',
      'Independent art director behind visual identities for music festivals and publishers. Leads the brand identity and typography track.'
    ),
  },
  {
    id: 'teacher-andrea-galli',
    name: 'Andrea Galli',
    slugValue: 'andrea-galli',
    role: ls('Songwriter e producer', 'Songwriter and producer'),
    bio: ls(
      'Autore e produttore pop con collaborazioni major. Nel suo corso porta il metodo delle writing session professionali.',
      'Pop writer and producer with major-label collaborations. Brings professional writing-session methods to the classroom.'
    ),
  },
]

for (const t of teachers) {
  docs.push({
    _id: t.id,
    _type: 'teacher',
    name: t.name,
    slug: slug(t.slugValue),
    role: t.role,
    bio: t.bio,
    links: [],
  })
}

/* --- corsi --- */

const courses = [
  {
    id: 'course-produzione-musica-elettronica',
    title: ls('Produzione di musica elettronica', 'Electronic music production'),
    slugValue: 'produzione-musica-elettronica',
    category: 'courseCategory-musica',
    teachers: ['teacher-marta-ferri', 'teacher-sara-conti'],
    summary: ls(
      'Dal primo loop alla release: sound design, arrangiamento, mix e pubblicazione di un EP completo.',
      'From first loop to release: sound design, arrangement, mixing and publishing a full EP.'
    ),
    body: blocks(
      'Un anno di laboratorio permanente in cui ogni studente produce, mixa e pubblica un EP. Si lavora in piccoli gruppi nelle regie del hub, alternando sessioni tecniche e ascolti critici.',
      'Il percorso copre sintesi, campionamento, arrangiamento, mixing e le basi del mastering, con un modulo finale dedicato a distribuzione e diritti.'
    ),
    duration: ls('9 mesi — 320 ore', '9 months — 320 hours'),
    startDate: ls('ottobre 2026', 'october 2026'),
    level: ls('Base / intermedio', 'Beginner / intermediate'),
    mode: ls('In sede', 'On site'),
    language: ls('Italiano', 'Italian'),
    featured: true,
  },
  {
    id: 'course-songwriting-produzione-pop',
    title: ls('Songwriting e produzione pop', 'Songwriting and pop production'),
    slugValue: 'songwriting-produzione-pop',
    category: 'courseCategory-musica',
    teachers: ['teacher-andrea-galli', 'teacher-marta-ferri'],
    summary: ls(
      'Scrittura, topline e produzione in writing session reali, con feedback da autori e A&R ospiti.',
      'Writing, toplines and production in real writing sessions, with feedback from guest writers and A&R.'
    ),
    body: blocks(
      'Il corso replica il flusso di lavoro delle writing session professionali: brief, co-scrittura, demo e revisione. Ogni mese una writing camp interna con ospiti dell’industria.',
      'Si approfondiscono struttura del brano, testo, melodia e produzione vocale, fino alla preparazione di un catalogo di demo pronte per il pitch.'
    ),
    duration: ls('6 mesi — 180 ore', '6 months — 180 hours'),
    startDate: ls('novembre 2026', 'november 2026'),
    level: ls('Intermedio', 'Intermediate'),
    mode: ls('Ibrido', 'Hybrid'),
    language: ls('Italiano', 'Italian'),
    featured: false,
  },
  {
    id: 'course-sound-engineering',
    title: ls('Sound engineering', 'Sound engineering'),
    slugValue: 'sound-engineering',
    category: 'courseCategory-suono',
    teachers: ['teacher-luca-bianchi', 'teacher-sara-conti'],
    summary: ls(
      'Il percorso completo del fonico di studio: microfonazione, registrazione, editing e mix su console SSL.',
      'The complete studio engineer path: mic techniques, tracking, editing and mixing on an SSL console.'
    ),
    body: blocks(
      'Formazione intensiva nelle sale del hub: teoria del segnale, acustica, microfoni, preamplificatori, workflow in Pro Tools e mix su console SSL.',
      'Il corso include sessioni di registrazione reali con band e ensemble, dalla pre-produzione alla consegna dei master.'
    ),
    duration: ls('12 mesi — 480 ore', '12 months — 480 hours'),
    startDate: ls('ottobre 2026', 'october 2026'),
    level: ls('Base / intermedio', 'Beginner / intermediate'),
    mode: ls('In sede', 'On site'),
    language: ls('Italiano', 'Italian'),
    featured: true,
  },
  {
    id: 'course-mixing-mastering',
    title: ls('Mixing e mastering', 'Mixing and mastering'),
    slugValue: 'mixing-mastering',
    category: 'courseCategory-suono',
    teachers: ['teacher-sara-conti'],
    summary: ls(
      'Ascolto critico, bilanci, dinamica e loudness: il mestiere di chiudere un disco, in analogico e in the box.',
      'Critical listening, balance, dynamics and loudness: the craft of finishing a record, analog and in the box.'
    ),
    body: blocks(
      'Un corso avanzato per chi già produce: catena di mix, gestione della dinamica, riferimenti, traduzione su sistemi diversi e standard di loudness per streaming e vinile.',
      'Le sessioni pratiche si svolgono nella suite di mastering del hub, su materiale portato dagli studenti.'
    ),
    duration: ls('4 mesi — 120 ore', '4 months — 120 hours'),
    startDate: ls('gennaio 2027', 'january 2027'),
    level: ls('Avanzato', 'Advanced'),
    mode: ls('In sede', 'On site'),
    language: ls('Italiano', 'Italian'),
    featured: false,
  },
  {
    id: 'course-tecnico-suono-live',
    title: ls('Tecnico del suono live', 'Live sound engineering'),
    slugValue: 'tecnico-suono-live',
    category: 'courseCategory-suono',
    teachers: ['teacher-luca-bianchi'],
    summary: ls(
      'FOH, monitor e palco: la filiera del concerto dal soundcheck al mix front of house.',
      'FOH, monitors and stage: the concert pipeline from soundcheck to front of house mix.'
    ),
    body: blocks(
      'Dalla lettura del rider al mix in sala: line array, console digitali, radiofrequenze e gestione del palco, con uscite pratiche nei club e nei festival partner del hub.'
    ),
    duration: ls('6 mesi — 200 ore', '6 months — 200 hours'),
    startDate: ls('febbraio 2027', 'february 2027'),
    level: ls('Base', 'Beginner'),
    mode: ls('In sede', 'On site'),
    language: ls('Italiano', 'Italian'),
    featured: false,
  },
  {
    id: 'course-creative-coding',
    title: ls('Creative coding e media interattivi', 'Creative coding and interactive media'),
    slugValue: 'creative-coding-media-interattivi',
    category: 'courseCategory-multimedia',
    teachers: ['teacher-davide-ricci'],
    summary: ls(
      'Programmare immagini, suono e sensori: TouchDesigner, WebGL e installazioni interattive.',
      'Programming visuals, sound and sensors: TouchDesigner, WebGL and interactive installations.'
    ),
    body: blocks(
      'Un laboratorio di arte generativa e sistemi interattivi: realtime graphics, audio reattivo, sensoristica e protocolli di rete per installazioni e live media.',
      'Il progetto finale è un’installazione collettiva esposta durante l’open day del hub.'
    ),
    duration: ls('8 mesi — 260 ore', '8 months — 260 hours'),
    startDate: ls('ottobre 2026', 'october 2026'),
    level: ls('Intermedio', 'Intermediate'),
    mode: ls('Ibrido', 'Hybrid'),
    language: ls('Italiano', 'Italian'),
    featured: true,
  },
  {
    id: 'course-postproduzione-audio-video',
    title: ls('Postproduzione audio-video', 'Audio-video post production'),
    slugValue: 'postproduzione-audio-video',
    category: 'courseCategory-multimedia',
    teachers: ['teacher-luca-bianchi', 'teacher-davide-ricci'],
    summary: ls(
      'Montaggio, sound design e color: la post per cinema, serie e branded content.',
      'Editing, sound design and color: post production for film, series and branded content.'
    ),
    body: blocks(
      'Il corso attraversa l’intera filiera della post: montaggio, sound design, foley, mix in 5.1 e Atmos nella suite del hub, conform e color grading.'
    ),
    duration: ls('9 mesi — 300 ore', '9 months — 300 hours'),
    startDate: ls('novembre 2026', 'november 2026'),
    level: ls('Intermedio', 'Intermediate'),
    mode: ls('In sede', 'On site'),
    language: ls('Italiano', 'Italian'),
    featured: false,
  },
  {
    id: 'course-graphic-design-identita',
    title: ls('Graphic design e identità visiva', 'Graphic design and visual identity'),
    slugValue: 'graphic-design-identita-visiva',
    category: 'courseCategory-visual',
    teachers: ['teacher-elena-moretti'],
    summary: ls(
      'Tipografia, sistemi visivi e brand identity per la musica e la cultura.',
      'Typography, visual systems and brand identity for music and culture.'
    ),
    body: blocks(
      'Dalla griglia al sistema: tipografia, colore, layout e art direction, con committenze reali dal mondo musicale e culturale bolognese.',
      'Ogni studente esce con un portfolio di tre progetti completi di identità visiva.'
    ),
    duration: ls('9 mesi — 280 ore', '9 months — 280 hours'),
    startDate: ls('ottobre 2026', 'october 2026'),
    level: ls('Base / intermedio', 'Beginner / intermediate'),
    mode: ls('In sede', 'On site'),
    language: ls('Italiano', 'Italian'),
    featured: true,
  },
]

for (const c of courses) {
  docs.push({
    _id: c.id,
    _type: 'course',
    title: c.title,
    slug: slug(c.slugValue),
    category: ref(c.category),
    teachers: c.teachers.map((t) => refK(t)),
    summary: c.summary,
    body: { it: c.body },
    duration: c.duration,
    startDate: c.startDate,
    level: c.level,
    mode: c.mode,
    language: c.language,
    featured: c.featured,
  })
}

/* --- autori magazine --- */

const authors = [
  {
    id: 'author-giulia-riva',
    name: 'Giulia Riva',
    slugValue: 'giulia-riva',
    role: ls('Caporedattrice', 'Editor in chief'),
  },
  {
    id: 'author-marco-del-vecchio',
    name: 'Marco Del Vecchio',
    slugValue: 'marco-del-vecchio',
    role: ls('Redattore', 'Staff writer'),
  },
  {
    id: 'author-chiara-neri',
    name: 'Chiara Neri',
    slugValue: 'chiara-neri',
    role: ls('Contributor', 'Contributor'),
  },
]

for (const a of authors) {
  docs.push({
    _id: a.id,
    _type: 'author',
    name: a.name,
    slug: slug(a.slugValue),
    role: a.role,
  })
}

/* --- categorie magazine --- */

const magazineCategories = [
  { id: 'category-tecnologia', it: 'Tecnologia', en: 'Technology', slugValue: 'tecnologia' },
  { id: 'category-carriere', it: 'Carriere', en: 'Careers', slugValue: 'carriere' },
  { id: 'category-bologna', it: 'Bologna', en: 'Bologna', slugValue: 'bologna' },
  { id: 'category-industria', it: 'Industria', en: 'Industry', slugValue: 'industria' },
]

for (const c of magazineCategories) {
  docs.push({
    _id: c.id,
    _type: 'category',
    title: ls(c.it, c.en),
    slug: slug(c.slugValue),
  })
}

/* --- articoli --- */

const articles = [
  {
    id: 'article-ai-produzione-musicale',
    title: ls(
      'L’intelligenza artificiale sta cambiando la produzione musicale',
      'AI is changing music production'
    ),
    slugValue: 'ai-produzione-musicale',
    categories: ['category-tecnologia', 'category-industria'],
    author: 'author-giulia-riva',
    excerpt: ls(
      'Stem separation, mix assistito, mastering automatico: cosa resta del mestiere quando gli strumenti diventano intelligenti.',
      'Stem separation, assisted mixing, automatic mastering: what remains of the craft when tools get smart.'
    ),
    body: blocks(
      'Negli ultimi tre anni gli strumenti di produzione assistita sono passati dai laboratori di ricerca alle DAW che usiamo ogni giorno. La separazione delle sorgenti, un problema considerato irrisolvibile fino a poco tempo fa, è oggi un comando di menu.',
      'Ne abbiamo parlato con i docenti dell’academy: la tesi condivisa è che l’ascolto critico diventi più importante, non meno. Gli strumenti abbassano la soglia tecnica, ma alzano quella del gusto.'
    ),
    publishedAt: '2026-06-18T09:00:00Z',
    featured: true,
  },
  {
    id: 'article-lavorare-audio-2026',
    title: ls(
      'Lavorare nell’audio nel 2026: cinque profili che le aziende cercano',
      'Working in audio in 2026: five profiles companies are hiring'
    ),
    slugValue: 'lavorare-audio-2026',
    categories: ['category-carriere'],
    author: 'author-marco-del-vecchio',
    excerpt: ls(
      'Dal tecnico Atmos allo spatial audio designer per i giochi: la mappa delle professioni del suono che crescono.',
      'From Atmos engineers to spatial audio designers for games: a map of the growing sound professions.'
    ),
    body: blocks(
      'Il mercato dell’audio professionale è in trasformazione: la domanda si sposta verso l’immersivo, il gaming e i contenuti in tempo reale. Abbiamo incrociato gli annunci delle principali aziende del settore con le testimonianze dei nostri alumni.'
    ),
    publishedAt: '2026-06-02T09:00:00Z',
    featured: false,
  },
  {
    id: 'article-bologna-citta-musica',
    title: ls(
      'Bologna città della musica: la scena che riparte dai laboratori',
      'Bologna city of music: a scene restarting from its workshops'
    ),
    slugValue: 'bologna-citta-musica',
    categories: ['category-bologna'],
    author: 'author-chiara-neri',
    excerpt: ls(
      'Dai portici ai capannoni della Bolognina: viaggio negli spazi che stanno ridisegnando la scena creativa della città.',
      'From the porticoes to Bolognina warehouses: a tour of the spaces redrawing the city’s creative scene.'
    ),
    body: blocks(
      'Bologna è città creativa UNESCO per la musica dal 2006, ma la geografia della scena è cambiata: gli spazi ibridi — studio, aula, coworking — sono diventati il nuovo baricentro della produzione culturale.'
    ),
    publishedAt: '2026-05-20T09:00:00Z',
    featured: true,
  },
  {
    id: 'article-dolby-atmos-studi',
    title: ls(
      'Dolby Atmos negli studi indipendenti: moda o standard?',
      'Dolby Atmos in independent studios: trend or standard?'
    ),
    slugValue: 'dolby-atmos-studi-indipendenti',
    categories: ['category-tecnologia', 'category-industria'],
    author: 'author-marco-del-vecchio',
    excerpt: ls(
      'Le piattaforme spingono l’audio immersivo, ma quanto costa attrezzarsi e quando ha senso farlo.',
      'Platforms push immersive audio, but what does it cost to gear up and when does it make sense.'
    ),
    body: blocks(
      'Con le principali piattaforme di streaming che premiano i contenuti in audio immersivo, anche gli studi indipendenti si chiedono se e quando investire in una regia Atmos. Abbiamo fatto i conti con chi l’ha già fatto.'
    ),
    publishedAt: '2026-04-28T09:00:00Z',
    featured: false,
  },
  {
    id: 'article-portfolio-creativo',
    title: ls(
      'Come si costruisce un portfolio creativo che trova lavoro',
      'How to build a creative portfolio that gets you hired'
    ),
    slugValue: 'portfolio-creativo-lavoro',
    categories: ['category-carriere'],
    author: 'author-giulia-riva',
    excerpt: ls(
      'Meno pezzi, più processo: i consigli di art director e A&R su cosa guardano davvero quando valutano un candidato.',
      'Fewer pieces, more process: what art directors and A&R actually look at when reviewing candidates.'
    ),
    body: blocks(
      'Abbiamo chiesto a chi seleziona — art director, producer, A&R — cosa apre davvero le porte. La risposta ricorrente: un portfolio corto, curato, che racconta il processo e non solo il risultato.'
    ),
    publishedAt: '2026-03-15T09:00:00Z',
    featured: false,
  },
  {
    id: 'article-sync-licensing',
    title: ls(
      'Sync e licensing: la nuova economia della musica per immagini',
      'Sync and licensing: the new economy of music for picture'
    ),
    slugValue: 'sync-licensing-musica-immagini',
    categories: ['category-industria'],
    author: 'author-chiara-neri',
    excerpt: ls(
      'Serie, pubblicità e videogiochi pagano meglio dello streaming: come funziona il mercato delle sincronizzazioni.',
      'Series, ads and games pay better than streaming: how the sync market works.'
    ),
    body: blocks(
      'Per molti produttori indipendenti la sincronizzazione è ormai la prima voce di ricavo. Capire brief, splits e catene di diritti è diventata una competenza professionale a tutti gli effetti — tanto che l’academy le dedica un modulo.'
    ),
    publishedAt: '2026-02-10T09:00:00Z',
    featured: false,
  },
]

for (const a of articles) {
  docs.push({
    _id: a.id,
    _type: 'article',
    title: a.title,
    slug: slug(a.slugValue),
    categories: a.categories.map((c) => refK(c)),
    author: ref(a.author),
    excerpt: a.excerpt,
    body: { it: a.body },
    publishedAt: a.publishedAt,
    featured: a.featured,
  })
}

/* --- partner --- */

const partners = [
  'Sony Music',
  'Universal Music Group',
  'Warner Music Group',
  'RAI',
  'Mediaset',
  'Cinecittà',
  'Dolby',
  'Solid State Logic',
  'Adobe',
  'Ableton',
  'Steinberg',
  'Avid',
  'Apple',
  'Berklee College of Music',
]

partners.forEach((name, index) => {
  const id = `partner-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
  docs.push({
    _id: id,
    _type: 'partner',
    name,
    order: index + 1,
  })
})

/* --- spazi --- */

const lsK = (it, en) => ({ _type: 'localeString', _key: key(), ...ls(it, en) })

const spaces = [
  {
    id: 'space-open-desk',
    kind: 'coworking',
    order: 1,
    title: ls('Open desk', 'Open desk'),
    slugValue: 'open-desk',
    summary: ls(
      'Postazione flessibile nell’open space del hub, tra studi, aule e sala relax.',
      'Flexible desk in the hub’s open space, surrounded by studios and classrooms.'
    ),
    body: blocks(
      'L’open space del hub è pensato per chi lavora nelle industrie creative: postazioni con monitor, luce naturale, cabine per le call e accesso alle aree comuni. Contratti flessibili, dal giornaliero al mensile.'
    ),
    features: [
      lsK('Accesso 7/7 dalle 8 alle 22', 'Access 7/7, 8am–10pm'),
      lsK('Monitor e seduta ergonomica', 'Monitor and ergonomic chair'),
      lsK('Cabine call e phone booth', 'Call booths'),
      lsK('Caffè e area relax inclusi', 'Coffee and lounge included'),
    ],
  },
  {
    id: 'space-sala-riunioni',
    kind: 'coworking',
    order: 2,
    title: ls('Sala riunioni', 'Meeting room'),
    slugValue: 'sala-riunioni',
    summary: ls(
      'Sala per 10 persone con schermo 4K, videoconferenza e lavagna, prenotabile a ore.',
      'Room for 10 with 4K screen, video conferencing and whiteboard, bookable by the hour.'
    ),
    body: blocks(
      'La sala riunioni del hub è attrezzata per presentazioni, sessioni d’ascolto e call di produzione: schermo 4K, impianto stereo di qualità e videoconferenza integrata.'
    ),
    features: [
      lsK('Capienza 10 persone', 'Seats 10'),
      lsK('Schermo 4K e videoconferenza', '4K screen and video conferencing'),
      lsK('Impianto audio stereo', 'Stereo playback system'),
      lsK('Prenotazione a ore', 'Hourly booking'),
    ],
  },
  {
    id: 'space-day-pass',
    kind: 'coworking',
    order: 3,
    title: ls('Day pass', 'Day pass'),
    slugValue: 'day-pass',
    summary: ls(
      'Una giornata nel hub senza abbonamento: scrivania, wifi, caffè e community.',
      'One day at the hub without a membership: desk, wifi, coffee and community.'
    ),
    body: blocks(
      'Il day pass dà accesso per un giorno all’open space e alle aree comuni. È il modo più semplice per conoscere il hub: si prenota online e si paga solo quando serve.'
    ),
    features: [
      lsK('Valido un giorno, senza vincoli', 'Valid one day, no commitment'),
      lsK('Wifi in fibra e postazione', 'Fiber wifi and desk'),
      lsK('Accesso alle aree comuni', 'Access to common areas'),
    ],
  },
  {
    id: 'space-regia-ssl',
    kind: 'studio',
    order: 1,
    title: ls('Regia A — console SSL', 'Control room A — SSL console'),
    slugValue: 'regia-ssl',
    summary: ls(
      'La regia principale del hub: console SSL, monitoring di riferimento e outboard analogico.',
      'The hub’s main control room: SSL console, reference monitoring and analog outboard.'
    ),
    body: blocks(
      'La regia A è costruita attorno a una console SSL e a una selezione di outboard analogico. Acustica progettata su misura, monitoring main e nearfield, recall totale delle sessioni.'
    ),
    features: [
      lsK('Console SSL', 'SSL console'),
      lsK('Outboard analogico selezionato', 'Curated analog outboard'),
      lsK('Monitoring main + nearfield', 'Main + nearfield monitoring'),
      lsK('Pro Tools HDX', 'Pro Tools HDX'),
    ],
  },
  {
    id: 'space-sala-ripresa',
    kind: 'studio',
    order: 2,
    title: ls('Sala ripresa', 'Live room'),
    slugValue: 'sala-ripresa',
    summary: ls(
      'Sala di registrazione da 60 mq con acustica variabile, collegata alla regia A.',
      '60 sqm live room with variable acoustics, linked to control room A.'
    ),
    body: blocks(
      'Sessanta metri quadri con acustica variabile a pannelli, pensati per band, ensemble e sezioni d’archi. Linee microfoniche verso la regia A e vista diretta tra i musicisti.'
    ),
    features: [
      lsK('60 mq, acustica variabile', '60 sqm, variable acoustics'),
      lsK('Parco microfoni vintage e moderno', 'Vintage and modern mic locker'),
      lsK('Backline disponibile', 'Backline available'),
    ],
  },
  {
    id: 'space-suite-atmos',
    kind: 'studio',
    order: 3,
    title: ls('Suite Dolby Atmos', 'Dolby Atmos suite'),
    slugValue: 'suite-dolby-atmos',
    summary: ls(
      'Regia immersiva 7.1.4 certificata per mix musica e post produzione in Dolby Atmos.',
      'Certified 7.1.4 immersive room for music mixing and post production in Dolby Atmos.'
    ),
    body: blocks(
      'La suite immersiva del hub è una regia 7.1.4 calibrata per il mix in Dolby Atmos, sia musica sia post. Disponibile con o senza engineer residente.'
    ),
    features: [
      lsK('Sistema 7.1.4 calibrato', 'Calibrated 7.1.4 system'),
      lsK('Renderer Dolby Atmos', 'Dolby Atmos renderer'),
      lsK('Engineer residente su richiesta', 'Resident engineer on request'),
    ],
  },
]

for (const s of spaces) {
  docs.push({
    _id: s.id,
    _type: 'space',
    title: s.title,
    slug: slug(s.slugValue),
    kind: s.kind,
    summary: s.summary,
    body: { it: s.body },
    features: s.features,
    order: s.order,
  })
}

/* --- pagine --- */

const pages = [
  {
    id: 'page-home',
    pageId: 'home',
    hero: {
      title: ls(
        'L’infrastruttura creativa di Bologna',
        'Bologna’s creative infrastructure'
      ),
      lede: ls(
        'Coworking, academy, studi di registrazione e un magazine: un unico luogo dove suono, immagine e codice diventano professione.',
        'Coworking, academy, recording studios and a magazine: one place where sound, image and code become a profession.'
      ),
    },
    sections: [
      {
        _key: key(),
        kicker: ls('academy', 'academy'),
        title: ls('Imparare facendo, accanto a chi lavora', 'Learn by doing, next to working professionals'),
        body: {
          it: blocks(
            'I corsi dell’academy si svolgono negli stessi spazi in cui producono professionisti e aziende: le aule sono regie, gli esami sono progetti reali.'
          ),
        },
      },
      {
        _key: key(),
        kicker: ls('spazi', 'spaces'),
        title: ls('Studi e postazioni, dalla demo al master', 'Studios and desks, from demo to master'),
        body: {
          it: blocks(
            'Tre regie, una sala ripresa e una suite Dolby Atmos, più un coworking pensato per le industrie creative. Tutto prenotabile online.'
          ),
        },
      },
      {
        _key: key(),
        kicker: ls('magazine', 'magazine'),
        title: ls('Storie e strumenti per chi crea', 'Stories and tools for makers'),
        body: {
          it: blocks(
            'Il magazine del hub racconta tecnologia, carriere e la scena di Bologna, con lo sguardo di chi il settore lo abita ogni giorno.'
          ),
        },
      },
    ],
  },
  {
    id: 'page-innovazione',
    pageId: 'innovazione',
    hero: {
      title: ls('Innovazione', 'Innovation'),
      lede: ls(
        'Ricerca applicata su audio immersivo, intelligenza artificiale e media interattivi, in collaborazione con aziende e università.',
        'Applied research on immersive audio, AI and interactive media, with companies and universities.'
      ),
    },
    sections: [
      {
        _key: key(),
        kicker: ls('audio immersivo', 'immersive audio'),
        title: ls('Un laboratorio permanente sull’Atmos', 'A permanent Atmos lab'),
        body: {
          it: blocks(
            'La suite 7.1.4 del hub è anche un laboratorio di ricerca: formati immersivi, spatial audio per XR e nuove pratiche di mix vengono testati con i partner tecnologici.'
          ),
        },
      },
      {
        _key: key(),
        kicker: ls('intelligenza artificiale', 'artificial intelligence'),
        title: ls('AI come strumento, non come scorciatoia', 'AI as a tool, not a shortcut'),
        body: {
          it: blocks(
            'Sperimentiamo strumenti di produzione assistita dentro i corsi e nei progetti degli studi, misurando dove aggiungono valore reale al lavoro creativo.'
          ),
        },
      },
      {
        _key: key(),
        kicker: ls('rete', 'network'),
        title: ls('Con le aziende, dentro la città', 'With companies, inside the city'),
        body: {
          it: blocks(
            'Progetti pilota con label, broadcaster e software house: il hub è il punto in cui domanda industriale e talento in formazione si incontrano.'
          ),
        },
      },
    ],
  },
  {
    id: 'page-chi-siamo',
    pageId: 'chi-siamo',
    hero: {
      title: ls('Chi siamo', 'About us'),
      lede: ls(
        'Dal 1999 formiamo professionisti della musica, del suono e dell’immagine. Oggi siamo un hub creativo nel cuore produttivo di Bologna.',
        'Training music, sound and visual professionals since 1999. Today, a creative hub in Bologna’s productive heart.'
      ),
    },
    sections: [
      {
        _key: key(),
        kicker: ls('storia', 'history'),
        title: ls('Da scuola a infrastruttura', 'From school to infrastructure'),
        body: {
          it: blocks(
            'Nati come scuola di tecnico del suono, siamo cresciuti insieme alla scena della città: prima gli studi, poi il coworking, oggi un ecosistema completo in via del tappezziere.'
          ),
        },
      },
      {
        _key: key(),
        kicker: ls('luogo', 'place'),
        title: ls('Duemila metri quadri di produzione culturale', 'Two thousand square meters of cultural production'),
        body: {
          it: blocks(
            'Aule, regie, sala ripresa, suite immersiva, open space e spazi per eventi: un ex capannone industriale riconvertito a fabbrica creativa.'
          ),
        },
      },
      {
        _key: key(),
        kicker: ls('persone', 'people'),
        title: ls('Una community di docenti, alumni e professionisti', 'A community of teachers, alumni and professionals'),
        body: {
          it: blocks(
            'Chi insegna qui lavora nel settore; chi studia qui entra in una rete di alumni attiva in tutta Europa. La porta d’ingresso è l’open day.'
          ),
        },
      },
    ],
  },
]

for (const p of pages) {
  docs.push({
    _id: p.id,
    _type: 'page',
    pageId: p.pageId,
    hero: p.hero,
    sections: p.sections.map((s) => ({ _type: 'pageSection', ...s })),
  })
}

/* ---------- esecuzione ---------- */

async function run() {
  console.log(`Seed di ${docs.length} documenti su ${client.config().projectId}/${client.config().dataset}…`)
  let tx = client.transaction()
  for (const doc of docs) {
    tx = tx.createOrReplace(doc)
  }
  const result = await tx.commit()
  console.log(`Fatto. Transaction: ${result.transactionId}`)
  console.log(
    docs
      .map((d) => `  ${d._type.padEnd(16)} ${d._id}`)
      .join('\n')
  )
}

run().catch((err) => {
  console.error('Seed fallito:', err.message)
  process.exit(1)
})
