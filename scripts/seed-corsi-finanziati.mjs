/**
 * Corsi gratuiti finanziati (Regione Emilia-Romagna + FSE+): crea i
 * documenti `course` delle card del mockup /academy/formazione-finanziata.
 *
 * Uso: node scripts/seed-corsi-finanziati.mjs
 *
 * Idempotente: createIfNotExists sul documento, poi patch dei soli campi
 * che il mockup detta (titolo, categoria, sommario, durata, stato, ordine).
 * Rilanciarlo riallinea le card al mockup senza toccare i contenuti di
 * scheda scritti in Sanity (body, competenze, ammissioni, selezione…).
 *
 * Music Data Analyst & Strategist esiste già con la sua scheda completa:
 * NON viene ricreato né sovrascritto, riceve solo i tre campi nuovi che
 * la griglia del mockup richiede (stato, durata breve, ordine) e la
 * categoria "dati e marketing musicale" che il mockup gli assegna.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@sanity/client'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = {}
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: env.SANITY_API_TOKEN,
  apiVersion: '2026-07-01',
  useCdn: false,
})

/* ————— categorie ————— */
/* le pillole filtro del mockup sono Tutti / Suono / Musica / Dati / 3D e VR:
   suono e musica esistono già, le altre due vanno create. Il titolo della
   categoria è il kicker della card, più esteso dell'etichetta del filtro. */
const CATEGORIES = [
  {
    _id: 'courseCategory-dati',
    slug: 'dati',
    title: { it: 'Dati e marketing musicale', en: 'Data and music marketing' },
  },
  {
    _id: 'courseCategory-3d-vr',
    slug: '3d-e-vr',
    title: { it: '3D e realtà virtuale', en: '3D and virtual reality' },
  },
]

/* ————— corsi del mockup ————— */
/* summary = la descrizione della card; durationShort = la riga meta
   ("3,5 mesi"), che su Music Data Analyst è diversa dalla durata estesa
   della scheda. La città e il "gratuito" della riga meta sono copy di
   pagina, non dati del corso. */
const COURSES = [
  {
    _id: 'course-fin-sound-design-immersivo',
    slug: 'sound-design-immersivo',
    order: 20,
    category: 'courseCategory-suono',
    title: { it: 'Sound Design Immersivo', en: 'Sound Design Immersivo' },
    summary: {
      it: 'Audio spaziale, intelligenza artificiale e flussi di lavoro per cinema, streaming e gaming, con Dolby Atmos e audio interattivo.',
      en: 'Spatial audio, artificial intelligence and workflows for film, streaming and gaming, with Dolby Atmos and interactive audio.',
    },
    duration: { it: '3,5 mesi', en: '3.5 months' },
  },
  {
    _id: 'course-fin-produzione-audio-spaziale',
    slug: 'produzione-audio-spaziale-e-suoni-immersivi',
    order: 30,
    category: 'courseCategory-suono',
    title: {
      it: 'Produzione Audio-Spaziale e Suoni Immersivi',
      en: 'Produzione Audio-Spaziale e Suoni Immersivi',
    },
    summary: {
      it: 'Audio immersivo in Dolby Atmos e surround 5.1 per cinema, TV e produzioni audiovisive.',
      en: 'Immersive audio in Dolby Atmos and 5.1 surround for film, TV and audiovisual production.',
    },
    duration: { it: '2,5 mesi', en: '2.5 months' },
  },
  {
    _id: 'course-fin-multimedia-sound-designer',
    slug: 'multimedia-sound-designer',
    order: 40,
    category: 'courseCategory-suono',
    title: { it: 'Multimedia Sound Designer', en: 'Multimedia Sound Designer' },
    summary: {
      it: 'Progettare e ottimizzare l’audio per ambienti digitali interattivi e immersivi.',
      en: 'Designing and optimising audio for interactive, immersive digital environments.',
    },
    duration: { it: '2 anni', en: '2 years' },
  },
  {
    _id: 'course-fin-digital-composer-producer',
    slug: 'digital-composer-and-producer',
    order: 50,
    category: 'courseCategory-musica',
    title: { it: 'Digital Composer and Producer', en: 'Digital Composer and Producer' },
    summary: {
      it: 'Arrangiamento e produzione digitale: DAW, MIDI e strumenti virtuali per creare brani.',
      en: 'Arrangement and digital production: DAWs, MIDI and virtual instruments to build tracks.',
    },
    duration: { it: '3 mesi', en: '3 months' },
  },
  {
    _id: 'course-fin-songwriter-vocal-artist',
    slug: 'songwriter-and-vocal-artist',
    order: 60,
    category: 'courseCategory-musica',
    title: { it: 'Songwriter and Vocal Artist', en: 'Songwriter and Vocal Artist' },
    summary: {
      it: 'Scrittura su commissione per etichette ed editori, co-writing e sync per pubblicità, cinema e audiovisivo.',
      en: 'Writing on commission for labels and publishers, co-writing and sync for advertising, film and audiovisual.',
    },
    duration: { it: '3,5 mesi', en: '3.5 months' },
  },
  {
    _id: 'course-fin-tecnico-modellatore-3d',
    slug: 'tecnico-modellatore-3d',
    order: 70,
    category: 'courseCategory-3d-vr',
    title: { it: 'Tecnico Modellatore 3D', en: 'Tecnico Modellatore 3D' },
    summary: {
      it: 'Personaggi e mondi virtuali con Blender e Unreal Engine, motion capture e VR. Corso IFTS.',
      en: 'Characters and virtual worlds with Blender and Unreal Engine, motion capture and VR. IFTS course.',
    },
    duration: { it: '7 mesi · 800 ore', en: '7 months · 800 hours' },
  },
]

/* il corso già a catalogo: riceve solo i campi di griglia, mai la scheda */
const MDA_ID = 'course-fin-music-data-analyst'

async function run() {
  const tx = client.transaction()

  for (const c of CATEGORIES) {
    tx.createIfNotExists({
      _id: c._id,
      _type: 'courseCategory',
      title: { _type: 'localeString', ...c.title },
      slug: { _type: 'slug', current: c.slug },
    })
    tx.patch(c._id, (p) =>
      p.set({
        title: { _type: 'localeString', ...c.title },
        slug: { _type: 'slug', current: c.slug },
      })
    )
  }

  for (const c of COURSES) {
    /* scheletro minimo: i campi richiesti dallo schema, così il documento
       è valido anche prima che qualcuno scriva la scheda in Studio */
    tx.createIfNotExists({
      _id: c._id,
      _type: 'course',
      title: { _type: 'localeString', ...c.title },
      slug: { _type: 'slug', current: c.slug },
      category: { _type: 'reference', _ref: c.category },
    })
    tx.patch(c._id, (p) =>
      p.set({
        title: { _type: 'localeString', ...c.title },
        slug: { _type: 'slug', current: c.slug },
        category: { _type: 'reference', _ref: c.category },
        types: ['finanziato', 'gratuito'],
        summary: { _type: 'localeText', ...c.summary },
        duration: { _type: 'localeString', ...c.duration },
        durationShort: { _type: 'localeString', ...c.duration },
        mode: { _type: 'localeString', it: 'In sede a Bologna', en: 'On site in Bologna' },
        /* nessuna di queste edizioni ha un bando aperto (mockup) */
        editionStatus: 'prossima-edizione',
        order: c.order,
      })
    )
  }

  /* Music Data Analyst & Strategist: solo i campi di griglia del mockup —
     è in svolgimento, apre la lista, e la sua riga meta è "3 mesi · 380
     ore" mentre la scheda tiene la durata estesa. */
  tx.patch(MDA_ID, (p) =>
    p.set({
      editionStatus: 'in-corso',
      durationShort: {
        _type: 'localeString',
        it: '3 mesi · 380 ore',
        en: '3 months · 380 hours',
      },
      order: 10,
      category: { _type: 'reference', _ref: 'courseCategory-dati' },
    })
  )

  await tx.commit()

  const check = await client.fetch(
    `*[_type == "course" && "finanziato" in types] | order(order asc) {
      "slug": slug.current, "cat": category->slug.current, editionStatus, order,
      "meta": durationShort.it
    }`
  )
  console.log('corsi finanziati a catalogo:')
  for (const row of check) {
    console.log(
      ` · ${row.order ?? '—'}  ${row.slug}  [${row.cat}]  ${row.editionStatus}  — ${row.meta}`
    )
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
