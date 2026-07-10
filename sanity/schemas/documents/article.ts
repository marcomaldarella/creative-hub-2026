import { defineField, defineType } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Articolo',
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
      name: 'categories',
      title: 'Categorie',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'author',
      title: 'Autore',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'excerpt',
      title: 'Estratto',
      type: 'localeText',
    }),
    defineField({
      name: 'body',
      title: 'Contenuto',
      type: 'localeBlock',
    }),
    defineField({
      name: 'coverImage',
      title: 'Immagine di copertina',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data di pubblicazione',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'In evidenza',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Data di pubblicazione (recenti prima)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title.it', subtitle: 'author.name', media: 'coverImage' },
  },
})
