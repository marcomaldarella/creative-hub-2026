import type { Metadata, Viewport } from 'next'
import { metadata as studioMetadata } from 'next-sanity/studio'

// Secondo root layout: lo studio vive fuori da [locale] e senza chrome del sito.
export const metadata: Metadata = {
  ...studioMetadata,
  title: 'sanity studio — creative hub',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
