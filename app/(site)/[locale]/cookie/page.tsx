import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { LegalPage, legalMeta } from '@/components/sections/LegalPage'
import { isLocale } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  return legalMeta((await params).locale, 'cookie')
}

export default async function CookiePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <SiteChrome locale={locale} path="/cookie">
      <LegalPage locale={locale} kind="cookie" />
    </SiteChrome>
  )
}
