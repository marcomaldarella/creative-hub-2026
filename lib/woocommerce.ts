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

/** le otto formule del riquadro coworking, nell'ordine di
    t.coworking.tableRows → slug del prodotto (l'ufficio è il prodotto
    locale non acquistabile: scheda interna su /prenota/ufficio) */
export const COWORKING_ROW_SLUGS: string[] = [
  'day-pass',
  'day-pass-pacchetto-10-ingressi',
  'quick-desk',
  'full-desk',
  'vip-quick-pass-annuale',
  'ufficio',
  'sala-didattica',
  'area-culture',
]

/** listino di categoria sullo shop (per le voci senza prodotto) */
export function shopCategoryUrl(category: WcCategory): string {
  return `${SHOP_BASE}/categoria-prodotto/${category}/`
}

/** prezzo in centesimi → "9,50 €" / "9.50 €" (vuoto se su richiesta) */
export function formatPrice(cents: number, locale: 'it' | 'en'): string {
  if (!cents) return ''
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

/* L'ufficio non è mai stato un prodotto WooCommerce (nemmeno sul sito
   vecchio: "ala coworking con uffici per startup ed enti", si tratta su
   misura). Entra nel catalogo dal locale con la sua scheda su
   /prenota/ufficio e NESSUN link di acquisto (permalink vuoto: la
   pagina prodotto nasconde il tasto "prenota" e resta il contatto).
   Se un giorno lo creano sullo shop, il prodotto vero vince. */
const UFFICIO: WcProduct = {
  id: -1,
  name: 'Ufficio',
  slug: 'ufficio',
  permalink: '',
  price: 0,
  regularPrice: 0,
  onSale: false,
  category: 'coworking',
  image: {
    src: '/img/sections/coworking-lounge.jpg',
    alt: 'La lounge del coworking: sedute e grafiche geometriche alle pareti',
  },
  descriptionHtml:
    "<p>L'ala coworking del Creative Hub ospita uffici privati per startup, enti e team che vogliono una base stabile dentro un hub di 2.000 mq dedicato alle industrie creative, in zona Roveri.</p>" +
    "<p>L'ufficio si definisce su misura: numero di postazioni, durata e servizi si concordano con la struttura. Si lavora con wifi in fibra FTTH, sale riunioni e cabine call, stampante e scanner, email @creativehub e posta in reception, caffè e cucina, giardino e aree relax, reception per i tuoi clienti.</p>" +
    '<p>Il prezzo è su richiesta: raccontaci di che spazio hai bisogno e ti prepariamo una proposta.</p>',
  shortDescriptionHtml:
    "<p>Un ufficio privato nell'ala coworking dell'hub, su misura per startup, enti e team: postazioni dedicate, accesso alla struttura e ai servizi comuni.</p>",
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
  const list = raw
    .map(normalize)
    .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
  if (!list.some((p) => p.slug === UFFICIO.slug)) list.push(UFFICIO)
  return list
}

export async function getBookableProduct(
  slug: string
): Promise<WcProduct | null> {
  const all = await getBookableProducts()
  return all.find((p) => p.slug === slug) ?? null
}
