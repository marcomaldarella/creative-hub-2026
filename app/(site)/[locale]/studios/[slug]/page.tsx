import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TopicScreen } from '@/components/sections/TopicScreen'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { findTopic, topicsOf } from '@/lib/topics'

export const dynamic = 'force-dynamic'

const BASE = '/studios' as const

export function generateStaticParams() {
  return topicsOf(BASE).map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const topic = findTopic(BASE, slug)
  if (!topic) return {}
  const t = getDictionary(locale)
  const copy = t.topics[topic.key as keyof typeof t.topics] as {
    title: string
    lede: string
  }
  return { title: copy.title, description: copy.lede }
}

export default async function TopicRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const topic = findTopic(BASE, slug)
  if (!topic) notFound()
  return <TopicScreen locale={locale} topic={topic} />
}
