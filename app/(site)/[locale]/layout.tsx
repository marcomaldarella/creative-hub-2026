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

export const metadata: Metadata = {
  title: {
    default: 'creative hub — bologna',
    template: '%s — creative hub',
  },
  description:
    "International college of music, sound, multimedia & visual. L'infrastruttura che trasforma suono, immagine e codice in professione. Bologna, dal 1999.",
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
        className={`${display.variable} ${body.variable} ${fat.variable}`}
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
        {children}
      </body>
    </html>
  )
}
