/**
 * Le voci del mega-menu che hanno una pagina propria.
 *
 * Prima erano ancore #hash su span invisibili: tecnicamente cliccabili, ma
 * tutte puntate allo stesso punto della pagina, quindi per chi naviga non
 * andavano da nessuna parte. Ora ogni voce senza una sezione reale ha un
 * URL suo, indicizzabile.
 *
 * Dove invece la sezione nella pagina indice esiste davvero (team, partner
 * e contatti in chi-siamo; registrazione, mix e affitto in studios;
 * coworking e prenota in coworking) la voce resta un'ancora: porta a
 * contenuto vero, non serve duplicarlo.
 *
 * `courseTypes` riempie la pagina con i corsi di quelle tipologie; senza,
 * la pagina mostra il testo e le eventuali sezioni scritte in Sanity
 * (documento `page` con pageId uguale allo slug).
 */

export type TopicBase =
  | '/academy'
  | '/studios'
  | '/coworking'
  | '/innovazione'
  | '/chi-siamo'

export type Topic = {
  /** ultimo segmento dell'URL */
  slug: string
  /** sezione a cui appartiene */
  base: TopicBase
  /** chiave dentro `topics` nei dizionari */
  key: string
  /** se presente, la pagina elenca i corsi di queste tipologie */
  courseTypes?: string[]
}

export const TOPICS: Topic[] = [
  /* ————— academy ————— */
  {
    slug: 'corsi-universitari',
    base: '/academy',
    key: 'corsiUniversitari',
    courseTypes: ['triennio', 'magistrale'],
  },
  {
    slug: 'formazione-finanziata',
    base: '/academy',
    key: 'formazioneFinanziata',
    courseTypes: ['finanziato'],
  },
  { slug: 'stage-placement', base: '/academy', key: 'stagePlacement' },
  {
    slug: 'corsi-custom',
    base: '/academy',
    key: 'corsiCustom',
    courseTypes: ['custom'],
  },
  { slug: 'open-day', base: '/academy', key: 'openDay' },
  { slug: 'servizi-studenti', base: '/academy', key: 'serviziStudenti' },

  /* ————— studio ————— */
  { slug: 'dolby-atmos', base: '/studios', key: 'dolbyAtmos' },
  { slug: 'sound-design', base: '/studios', key: 'soundDesign' },
  { slug: 'podcast', base: '/studios', key: 'podcast' },

  /* ————— coworking ————— */
  { slug: 'sale-eventi', base: '/coworking', key: 'saleEventi' },
  { slug: 'metaverso', base: '/coworking', key: 'metaverso' },

  /* ————— innovazione ————— */
  { slug: 'aziende', base: '/innovazione', key: 'aziende' },
  { slug: 'incubazione', base: '/innovazione', key: 'incubazione' },
  { slug: 'accelerazione', base: '/innovazione', key: 'accelerazione' },
  { slug: 'cte-cobo', base: '/innovazione', key: 'cteCobo' },
  { slug: 'bandi', base: '/innovazione', key: 'bandi' },

  /* ————— chi siamo ————— */
  { slug: 'ecosistema', base: '/chi-siamo', key: 'ecosistema' },
  { slug: 'governance', base: '/chi-siamo', key: 'governance' },
]

/** gli slug di una sezione: serve alle route [slug] per riconoscerli */
export function topicsOf(base: TopicBase): Topic[] {
  return TOPICS.filter((t) => t.base === base)
}

export function findTopic(base: TopicBase, slug: string): Topic | undefined {
  return TOPICS.find((t) => t.base === base && t.slug === slug)
}

/** tutti i percorsi (senza locale), per la sitemap */
export const TOPIC_PATHS = TOPICS.map((t) => `${t.base}/${t.slug}`)
