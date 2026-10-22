import type { PortableTextBlock } from '@portabletext/types'

/* ---------- localizzazione ---------- */

export interface LocaleString {
  it?: string
  en?: string
}

export interface LocaleText {
  it?: string
  en?: string
}

export interface LocaleBlock {
  it?: PortableTextBlock[]
  en?: PortableTextBlock[]
}

/* ---------- primitive Sanity ---------- */

export interface SanityImage {
  _type: 'image'
  asset?: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
}

export interface SanitySlug {
  _type: 'slug'
  current: string
}

export interface LabeledLink {
  _key: string
  label?: string
  url?: string
}

/* ---------- documenti ---------- */

export interface SiteSettings {
  _id: string
  _type: 'siteSettings'
  siteName?: string
  shopUrl?: string
  address?: string
  phone?: string
  email?: string
  social?: LabeledLink[]
  openDay?: {
    date?: string
    title?: LocaleString
    ctaUrl?: string
  }
}

export interface Teacher {
  _id: string
  _type: 'teacher'
  name?: string
  slug?: SanitySlug
  role?: LocaleString
  bio?: LocaleText
  photo?: SanityImage
  /** video di presentazione: file .mp4 o link YouTube (facoltativo) */
  videoUrl?: string
  links?: LabeledLink[]
}

export interface CourseCategory {
  _id: string
  _type: 'courseCategory'
  title?: LocaleString
  slug?: SanitySlug
}

/** Voce titolo+testo delle sezioni della scheda corso (template v3) */
export interface CourseEntry {
  _key?: string
  title?: LocaleString
  text?: LocaleText
}

/** Voce pesata della selezione (corsi finanziati): il peso è l'etichetta grossa */
export interface CourseSelectionEntry extends CourseEntry {
  weight?: string
}

/** Card prezzo delle lezioni su misura (prova / Smart / Standard) */
export interface CoursePackage {
  _key?: string
  name?: LocaleString
  /** testo libero, es. "96€" */
  price?: string
  /** es. "/ mese" */
  per?: LocaleString
  /** es. "circa 24€ a lezione" */
  unitNote?: LocaleString
  note?: LocaleString
  badge?: LocaleString
  features?: Array<LocaleString & { _key?: string }>
  /** valore preselezionato nel form; vuoto per la lezione di prova */
  plan?: string
}

export interface Course {
  _id: string
  _type: 'course'
  title?: LocaleString
  slug?: SanitySlug
  category?: CourseCategory
  teachers?: Teacher[]
  summary?: LocaleText
  body?: LocaleBlock
  coverImage?: SanityImage
  gallery?: SanityImage[]
  duration?: LocaleString
  /** riga meta breve della card in griglia, es. "3 mesi · 380 ore" */
  durationShort?: LocaleString
  /** pillola di stato nelle griglie dei corsi finanziati */
  editionStatus?: 'in-corso' | 'prossima-edizione' | 'iscrizioni-aperte'
  /** ordine crescente nelle griglie; assente = in fondo */
  order?: number
  startDate?: LocaleString
  /** scadenza per candidarsi, es. "30 giugno 2026" */
  applicationDeadline?: LocaleString
  level?: LocaleString
  mode?: LocaleString
  language?: LocaleString
  shopUrl?: string
  featured?: boolean
  types?: string[]
  skillsLede?: LocaleText
  skills?: CourseEntry[]
  structureIntro?: LocaleText
  structure?: CourseEntry[]
  admissionsKeys?: LocaleString[]
  admissions?: CourseEntry[]
  /** voci dell'accordion "Iscrizione." (corsi finanziati) */
  enrollment?: CourseEntry[]
  selectionLede?: LocaleText
  selection?: CourseSelectionEntry[]
  networkLede?: LocaleText
  network?: CourseEntry[]
  faq?: CourseEntry[]
  packages?: CoursePackage[]
  packagesTerms?: LocaleString[]
}

export interface Author {
  _id: string
  _type: 'author'
  name?: string
  slug?: SanitySlug
  role?: LocaleString
  photo?: SanityImage
}

export interface Category {
  _id: string
  _type: 'category'
  title?: LocaleString
  slug?: SanitySlug
}

export interface Article {
  _id: string
  _type: 'article'
  title?: LocaleString
  slug?: SanitySlug
  categories?: Category[]
  author?: Author
  excerpt?: LocaleText
  body?: LocaleBlock
  coverImage?: SanityImage
  publishedAt?: string
  featured?: boolean
}

export interface Partner {
  _id: string
  _type: 'partner'
  name?: string
  logo?: SanityImage
  url?: string
  order?: number
}

export type SpaceKind = 'coworking' | 'studio'

export interface Space {
  _id: string
  _type: 'space'
  title?: LocaleString
  slug?: SanitySlug
  kind?: SpaceKind
  summary?: LocaleText
  body?: LocaleBlock
  features?: Array<LocaleString & { _key: string }>
  images?: SanityImage[]
  order?: number
}

export type PageId =
  | 'home'
  | 'innovazione'
  | 'chi-siamo'
  | 'academy'
  | 'studio'
  | 'coworking'

/** Tabella di contenuto dentro un localeBlock (righe = oggetti tableRow) */
export interface ContentTable {
  _key?: string
  _type: 'contentTable'
  caption?: string
  columns?: string[]
  rows?: { _key?: string; _type?: 'tableRow'; cells?: string[] }[]
}

/** Fila di chip con etichetta opzionale, dentro un localeBlock */
export interface ChipList {
  _key?: string
  _type: 'chipList'
  label?: string
  items?: string[]
}

/** Card di una griglia indice: sigla, titolo, riga e ancora di arrivo */
export interface IndexCard {
  _key?: string
  _type?: 'indexCard'
  label?: string
  title?: string
  text?: string
  anchor?: string
}

/** Griglia indice ancorata, dentro un localeBlock */
export interface IndexGrid {
  _key?: string
  _type: 'indexGrid'
  items?: IndexCard[]
}

export interface PageSection {
  _key: string
  kicker?: LocaleString
  title?: LocaleString
  /** id della sezione (senza #): bersaglio delle griglie indice */
  anchor?: string
  /** riassunto in due righe: box scuro "in breve" in testa alla sezione */
  brief?: LocaleText
  body?: LocaleBlock
  /** rimandi in coda alla sezione: il primo bottone, gli altri ArrowLink */
  ctas?: { _key: string; label?: LocaleString; href?: string }[]
  images?: SanityImage[]
}

export interface Page {
  _id: string
  _type: 'page'
  pageId?: PageId
  hero?: {
    title?: LocaleString
    lede?: LocaleText
  }
  sections?: PageSection[]
}

/* ---------- aggregati ---------- */

export interface HomeData {
  settings: SiteSettings | null
  featuredCourses: Course[]
  latestArticles: Article[]
  partners: Partner[]
}
