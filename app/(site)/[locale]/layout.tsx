import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { Archivo, Geist } from 'next/font/google'
import localFont from 'next/font/local'
import { locales, isLocale } from '@/lib/i18n/config'
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
    // suppressHydrationWarning: lo script qui sotto scrive data-theme
    // su <html> prima dell'hydration, il mismatch è voluto
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} ${fat.variable} ${swiss.variable}`}
      >
        {/* tema prima del paint: localStorage, poi preferenza di sistema.
            next/script beforeInteractive: iniettato nell'head, niente
            warning React per script dentro il body */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}})()",
          }}
        />
        {/* preloader della home: il flag va scritto PRIMA del paint,
            altrimenti si vede la hero completa e poi il disco piccolo.
            Una volta per sessione, mai con moto ridotto; il timer di
            sicurezza lo toglie anche se React non idrata */}
        <Script
          id="boot-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var p=location.pathname.replace(/\\/$/,'');if(p!==''&&p!=='/en')return;if(sessionStorage.getItem('ch-booted'))return;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement;d.dataset.boot='1';setTimeout(function(){delete d.dataset.boot},4400)}catch(e){}})()",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        {children}
      </body>
    </html>
  )
}
