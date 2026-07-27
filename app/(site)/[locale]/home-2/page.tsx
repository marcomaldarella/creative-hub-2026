import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { HomeScreen } from '../home-screen'

export const dynamic = 'force-dynamic'

/* seconda versione dell'hero: pin in filigrana + caption, vedi HomeScreen */
export default async function Home2Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <HomeScreen locale={locale} heroV2 />
}
