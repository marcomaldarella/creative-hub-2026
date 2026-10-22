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
  /**
   * Apertura a solo titolo: i punti e la banda video scendono in fondo
   * alla pagina (i punti diventano card), così sotto al titolo arrivano
   * subito le card dei corsi. Senza il flag resta l'ordine di sempre —
   * punti, video, corsi.
   */
  pointsLast?: boolean
  /**
   * false = niente banda video sotto la testata: la pagina apre con il
   * solo testo, come nel mockup (servizi studenti).
   */
  heroMedia?: boolean
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
    pointsLast: true,
  },
  { slug: 'open-day', base: '/academy', key: 'openDay' },
  {
    slug: 'servizi-studenti',
    base: '/academy',
    key: 'serviziStudenti',
    heroMedia: false,
  },

  /* ————— studio ————— */
  /* registrazione, mix-mastering e affitto-studio hanno route statiche
     dedicate (mockup ott 2026): stanno qui per nav e sitemap, la route
     [slug] non li serve mai */
  { slug: 'registrazione', base: '/studios', key: 'registrazione' },
  { slug: 'mix-mastering', base: '/studios', key: 'mixMastering' },
  { slug: 'dolby-atmos', base: '/studios', key: 'dolbyAtmos' },
  { slug: 'sound-design', base: '/studios', key: 'soundDesign' },
  { slug: 'podcast', base: '/studios', key: 'podcast' },
  { slug: 'affitto-studio', base: '/studios', key: 'affittoStudio' },

  /* ————— coworking ————— */
  { slug: 'sale-eventi', base: '/coworking', key: 'saleEventi' },
  { slug: 'metaverso', base: '/coworking', key: 'metaverso' },

  /* ————— innovazione ————— */
  /* mockup ott 2026: incubazione e accelerazione sono lo stesso programma
     (CreaTech Venture Club) → una pagina sola; i vecchi slug vanno in 301
     (next.config.ts). Tutte e quattro hanno route statiche dedicate */
  {
    slug: 'incubazione-accelerazione',
    base: '/innovazione',
    key: 'incubazioneAccelerazione',
  },
  { slug: 'aziende', base: '/innovazione', key: 'aziende' },
  { slug: 'bandi', base: '/innovazione', key: 'bandi' },
  { slug: 'cte-cobo', base: '/innovazione', key: 'cteCobo' },

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
