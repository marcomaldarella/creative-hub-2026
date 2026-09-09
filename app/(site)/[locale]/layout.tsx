import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Archivo, Geist } from 'next/font/google'
import localFont from 'next/font/local'
import { locales, isLocale } from '@/lib/i18n/config'
import { PageTransition } from '@/components/sections/PageTransition'
import '@/app/globals.css'

const display = Archivo({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['wdth'],
  variable: '--font-display',
  display: 'swap',
})

const body = Geist({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-body',
  display: 'swap',
})

// FreeFat — il display ultra-fat dei titoli giganti (dal design di riferimento)
const fat = localFont({
  src: '../../fonts/FreeFat-Regular.woff',
  variable: '--font-fat',
  display: 'swap',
})

// Helvetica Neue (estratta dal .ttc dell'utente) — display svizzero.
// NB: per il go-live su dominio pubblico serve la licenza web Monotype
const swiss = localFont({
  src: [
    { path: '../../fonts/HelveticaNeue-Regular.woff2', weight: '400' },
    { path: '../../fonts/HelveticaNeue-Medium.woff2', weight: '500' },
    { path: '../../fonts/HelveticaNeue-Bold.woff2', weight: '700' },
  ],
  variable: '--font-swiss',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://bologna-creativehub.it'),
  title: {
    default: 'creative hub — bologna',
    template: '%s — creative hub',
  },
  description:
    "International college of music, sound, multimedia & visual. L'infrastruttura che trasforma suono, immagine e codice in professione. Bologna, dal 1999.",
  openGraph: {
    type: 'website',
    siteName: 'creative hub — bologna',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    locale: 'it_IT',
    alternateLocale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.png'],
  },
  alternates: {
    canonical: '/',
    languages: { it: '/', en: '/en' },
  },
}

/* La barra del browser (Safari iOS in testa) si tinge di theme-color.
   Lo schema è fisso (niente più switch): in cima alla pagina ci sono
   sempre nav e hero neri, quindi la barra è nera. */
export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'light',
}

// JSON-LD Organization (dati reali del sito live)
const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Creative Hub Bologna',
  url: 'https://bologna-creativehub.it',
  email: 'hello@bologna-creativehub.it',
  telephone: '+39 051 6313706',
  foundingDate: '1999',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'via del Tappezziere 4',
    postalCode: '40138',
    addressLocality: 'Bologna',
    addressCountry: 'IT',
  },
  sameAs: [
    'https://www.instagram.com/creative.hub.bologna/',
    'https://www.facebook.com/Bolognacreativehub',
    'https://www.linkedin.com/company/75527577/',
    'https://www.youtube.com/channel/UC7m00ZO8tAk5VV1GTP1alrA',
  ],
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    // suppressHydrationWarning: lo script della splash scrive data-boot
    // su <html> prima dell'hydration, il mismatch è voluto
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} ${fat.variable} ${swiss.variable}`}
      >
        {/* ⚠️ <script> RAW, non next/script: con strategy
            beforeInteractive Next mette il codice in coda al suo runtime
            (`self.__next_s.push(...)`), quindi in produzione girava DOPO
            il primo paint — si vedeva la hero completa e solo dopo partiva
            la splash. Un tag inline viene invece eseguito dal parser prima
            che il resto del body sia dipinto. */}

        {/* Splash della home. Lo script gira solo al CARICAMENTO del
            documento: arrivando su / (link esterno, reload, indirizzo
            digitato) parte sempre; tornando in home navigando dentro al
            sito non parte, perché il layout non si rimonta e questo codice
            non viene rieseguito. Nessun flag di sessione: era proprio
            quello a far vedere la splash una volta sola per scheda.
            Unica esclusione: prefers-reduced-motion, con try/catch proprio.
            Il timer di sicurezza toglie il flag anche se React non idrata
            o se GSAP non carica. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              /* niente regex qui dentro: la barra va sfuggita nel sorgente
                 TS e nell'HTML finiva `replace(//$/,'')`, cioè un errore
                 di sintassi che spegneva del tutto la splash */
              "(function(){try{var p=location.pathname;if(p.charAt(p.length-1)==='/')p=p.slice(0,-1);if(p!==''&&p!=='/en')return;try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return}catch(e){}var d=document.documentElement;d.dataset.boot='1';setTimeout(function(){delete d.dataset.boot},9000)}catch(e){}})()",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        {/* transizione di pagina: gli scarabocchi SVG del reference
            CodeGrid nei colori brand (nero + azzurro) */}
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
