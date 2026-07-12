import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio'], // Sanity Studio embedded
    },
    sitemap: 'https://bologna-creativehub.it/sitemap.xml',
  }
}
