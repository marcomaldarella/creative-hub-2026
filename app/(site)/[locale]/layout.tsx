import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Archivo, DM_Sans, Geist_Mono } from 'next/font/google'
import { locales, isLocale } from '@/lib/i18n/config'
import '@/app/globals.css'

const display = Archivo({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['wdth'],
  variable: '--font-display',
  display: 'swap',
})

const body = DM_Sans({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-body',
  display: 'swap',
})

const mono = Geist_Mono({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-mono',
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
    <html lang={locale}>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  )
}
