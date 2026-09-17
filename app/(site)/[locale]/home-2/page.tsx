import { notFound, redirect } from 'next/navigation'
import { isLocale, localeHref } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

/* l'hero swiper è stato promosso sulla home: i vecchi link a /home-2
   (girati al cliente durante la lavorazione) atterrano lì */
export default async function Home2Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  redirect(localeHref(locale, '/'))
}
