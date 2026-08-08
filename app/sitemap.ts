import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import { TOPIC_PATHS } from '@/lib/topics'

const BASE = 'https://bologna-creativehub.it'

const SECTIONS = [
  '',
  '/academy',
  '/studios',
  '/coworking',
  '/innovazione',
  '/magazine',
  '/chi-siamo',
  '/privacy',
  '/cookie',
  '/trasparenza',
]

/** sitemap IT (root) + EN (/en), con gli slug reali da Sanity */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, articles] = await Promise.all([
    client.fetch<{ slug: string }[]>(
      `*[_type == "course" && defined(slug.current)]{ "slug": slug.current }`
    ),
    client.fetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "article" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    ),
  ])

  const now = new Date()
  const paths: { path: string; lastModified: Date; priority: number }[] = [
    ...SECTIONS.map((s) => ({ path: s, lastModified: now, priority: s === '' ? 1 : 0.8 })),
    /* le pagine delle voci di menu (lib/topics) */
    ...TOPIC_PATHS.map((p) => ({ path: p, lastModified: now, priority: 0.7 })),
    ...courses.map((c) => ({ path: `/academy/${c.slug}`, lastModified: now, priority: 0.6 })),
    ...articles.map((a) => ({
      path: `/magazine/${a.slug}`,
      lastModified: new Date(a._updatedAt),
      priority: 0.6,
    })),
  ]

  return paths.flatMap(({ path, lastModified, priority }) => [
    {
      url: `${BASE}${path || '/'}`,
      lastModified,
      priority,
      alternates: {
        languages: { it: `${BASE}${path || '/'}`, en: `${BASE}/en${path}` },
      },
    },
    { url: `${BASE}/en${path}`, lastModified, priority: priority * 0.9 },
  ])
}
