'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

export default defineConfig({
  name: 'creative-hub',
  title: 'creative hub — bologna',
  projectId,
  dataset,
  basePath: '/admin', // NON /studio: troppo vicino a /studios (pagina del sito)
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
  document: {
    // il singleton siteSettings non deve essere creabile dal menu "new document"
    newDocumentOptions: (prev) =>
      prev.filter((item) => item.templateId !== 'siteSettings'),
  },
})
