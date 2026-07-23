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
  links?: LabeledLink[]
}

export interface CourseCategory {
  _id: string
  _type: 'courseCategory'
  title?: LocaleString
  slug?: SanitySlug
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
  duration?: LocaleString
  startDate?: LocaleString
  level?: LocaleString
  mode?: LocaleString
  language?: LocaleString
  shopUrl?: string
  featured?: boolean
  types?: string[]
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

export interface PageSection {
  _key: string
  kicker?: LocaleString
  title?: LocaleString
  body?: LocaleBlock
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
