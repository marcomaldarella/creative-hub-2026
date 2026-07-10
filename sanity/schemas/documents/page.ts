import { defineField, defineType } from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Pagina',
  type: 'document',
  fields: [
    defineField({
      name: 'pageId',
      title: 'ID pagina',
      type: 'string',
      options: {
        list: [
          { title: 'Home', value: 'home' },
          { title: 'Innovazione', value: 'innovazione' },
          { title: 'Chi siamo', value: 'chi-siamo' },
          { title: 'Academy', value: 'academy' },
          { title: 'Studio', value: 'studio' },
          { title: 'Coworking', value: 'coworking' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Titolo', type: 'localeString' }),
        defineField({ name: 'lede', title: 'Lede', type: 'localeText' }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Sezioni',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'pageSection',
          title: 'Sezione',
          fields: [
            defineField({ name: 'kicker', title: 'Kicker', type: 'localeString' }),
            defineField({ name: 'title', title: 'Titolo', type: 'localeString' }),
            defineField({ name: 'body', title: 'Contenuto', type: 'localeBlock' }),
            defineField({
              name: 'images',
              title: 'Immagini',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
            }),
          ],
          preview: {
            select: { title: 'title.it', subtitle: 'kicker.it' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'pageId', subtitle: 'hero.title.it' },
  },
})
