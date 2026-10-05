import fallbackRaw from './wc-fallback.json'

/* Catalogo prenotazioni: lo shop resta su WooCommerce (vincolo di progetto,
   zero logica carrello in Next). Qui leggiamo la Store API pubblica di
   bologna-creativehub.it per rendere /prenota sempre allineata a nomi,
   prezzi e foto reali; il checkout avviene sul permalink del prodotto WP.
   Se WordPress non risponde si usa lo snapshot lib/wc-fallback.json. */

const WC_BASE =
  process.env.NEXT_PUBLIC_WC_BASE ?? 'https://bologna-creativehub.it'

/* dove si COMPRA: finché il restyling WP vive su /staging, le CTA puntano
   lì (NEXT_PUBLIC_WC_SHOP_BASE); al go-live tornerà = WC_BASE */
const SHOP_BASE = process.env.NEXT_PUBLIC_WC_SHOP_BASE ?? WC_BASE

export type WcCategory = 'coworking' | 'coplaying'

export type WcProduct = {
  id: number
  name: string
  slug: string
  /** pagina prodotto WooCommerce: è QUI che si completa la prenotazione */
  permalink: string
  /** prezzo in centesimi; 0 = su richiesta (es. sala live, studio) */
  price: number
  regularPrice: number
  onSale: boolean
  category: WcCategory
  image: { src: string; alt: string } | null
  /** HTML WordPress già ripulito da stili inline e tag di formattazione */
  descriptionHtml: string
  shortDescriptionHtml: string
}

type RawProduct = {
  id: number
  name: string
  slug: string
  permalink: string
  prices: {
    price: string
    regular_price: string
    sale_price: string
    currency_minor_unit: number
  }
  on_sale: boolean
  categories: { name: string; slug: string }[]
  short_description: string
  description: string
  images: { src: string; alt?: string }[]
}

/* l'HTML dell'editor WP arriva pieno di span/font con stili inline che
   romperebbero la tipografia del sito: si tengono solo i tag strutturali */
function sanitizeWpHtml(html: string): string {
  return html
    .replace(/<\/?(?:span|font|div)[^>]*>/gi, '')
    .replace(/\s(?:style|class|dir|lang|data-[\w-]+)="[^"]*"/gi, '')
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .trim()
}

/* i nomi nel catalogo WP sono TUTTI MAIUSCOLI ("DAY PASS") ma la regola
   del sito è sentence case sempre: si riporta a frase, salvando i codici
   sala (HP101…) e le sigle */
function sentenceCase(name: string): string {
  const lower = name.toLowerCase().replace(/\s+/g, ' ').trim()
  return (lower.charAt(0).toUpperCase() + lower.slice(1))
    .replace(/\bhp(\d+)\b/gi, (_, n) => `HP${n}`)
    .replace(/\bvip\b/gi, 'VIP')
}

function categoryOf(raw: RawProduct): WcCategory {
  return raw.categories.some((c) => c.slug === 'coworking')
    ? 'coworking'
    : 'coplaying'
}

function normalize(raw: RawProduct): WcProduct {
  const first = raw.images[0]
  return {
    id: raw.id,
    name: sentenceCase(raw.name),
    slug: raw.slug,
    permalink: `${SHOP_BASE}/prodotto/${raw.slug}/`,
    price: Number(raw.prices.price) || 0,
    regularPrice: Number(raw.prices.regular_price) || 0,
    onSale: Boolean(raw.on_sale),
    category: categoryOf(raw),
    image: first ? { src: first.src, alt: first.alt ?? '' } : null,
    descriptionHtml: sanitizeWpHtml(raw.description),
    shortDescriptionHtml: sanitizeWpHtml(raw.short_description),
  }
}

/** prezzo in centesimi → "9,50 €" / "9.50 €" (vuoto se su richiesta) */
export function formatPrice(cents: number, locale: 'it' | 'en'): string {
  if (!cents) return ''
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

export async function getBookableProducts(): Promise<WcProduct[]> {
  let raw = fallbackRaw as RawProduct[]
  try {
    const res = await fetch(
      `${WC_BASE}/wp-json/wc/store/products?per_page=100`,
      { next: { revalidate: 3600 } }
    )
    if (res.ok) {
      const data = (await res.json()) as RawProduct[]
      if (Array.isArray(data) && data.length > 0) raw = data
    }
  } catch {
    /* WordPress giù: si resta sullo snapshot */
  }
  /* l'API ordina per data di pubblicazione: per il listino ha più senso
     il prezzo crescente, con i "su richiesta" (prezzo 0) in fondo */
  return raw
    .map(normalize)
    .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
}

export async function getBookableProduct(
  slug: string
): Promise<WcProduct | null> {
  const all = await getBookableProducts()
  return all.find((p) => p.slug === slug) ?? null
}
