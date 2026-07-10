import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  // Placeholder — sostituito dall'agente sezioni
  return (
    <main className="wrap" style={{ paddingTop: 'var(--nav-h)' }}>
      <h1 className="display-black" style={{ fontSize: 'var(--fs-h2)', marginTop: '2rem' }}>
        CREATIVE HUB
      </h1>
      <p className="mono">{t.hero.tagline}</p>
    </main>
  )
}
