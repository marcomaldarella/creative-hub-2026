import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { LegalPage, legalMeta } from '@/components/sections/LegalPage'
import { isLocale } from '@/lib/i18n/config'
import { pageAlternates } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return legalMeta(locale, 'privacy')
  return {
    ...legalMeta(locale, 'privacy'),
    alternates: pageAlternates(locale, '/privacy'),
  }
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <SiteChrome locale={locale} path="/privacy">
      <LegalPage locale={locale} kind="privacy" />
    </SiteChrome>
  )
}
