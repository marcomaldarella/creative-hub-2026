import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { pageAlternates } from '@/lib/seo'
import { HomeScreen } from './home-screen'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  /* title/description ereditati dal layout: qui solo canonical + hreflang */
  return { alternates: pageAlternates(locale, '/') }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <HomeScreen locale={locale} />
}
