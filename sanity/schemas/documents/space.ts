import { defineField, defineType } from 'sanity'

export const space = defineType({
  name: 'space',
  title: 'Spazio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title.it' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          { title: 'Coworking', value: 'coworking' },
          { title: 'Studio', value: 'studio' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Sommario',
      type: 'localeText',
    }),
    defineField({
      name: 'body',
      title: 'Contenuto',
      type: 'localeBlock',
    }),
    defineField({
      name: 'features',
      title: 'Caratteristiche',
      type: 'array',
      of: [{ type: 'localeString' }],
    }),
    defineField({
      name: 'images',
      title: 'Immagini',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'order',
      title: 'Ordine',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Ordine',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title.it', subtitle: 'kind' },
  },
})
