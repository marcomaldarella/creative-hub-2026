import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/studio'], // Sanity Studio embedded (+ vecchio path)
    },
    sitemap: 'https://bologna-creativehub.it/sitemap.xml',
  }
}
