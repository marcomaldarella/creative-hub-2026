import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Impostazioni sito',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Nome sito',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shopUrl',
      title: 'URL shop (WooCommerce)',
      type: 'url',
      description: 'Base URL del negozio esterno per iscrizioni e prenotazioni.',
    }),
    defineField({
      name: 'address',
      title: 'Indirizzo',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Telefono',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'social',
      title: 'Social',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          title: 'Social link',
          fields: [
            defineField({ name: 'label', title: 'Etichetta', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'openDay',
      title: 'Open day',
      type: 'object',
      fields: [
        defineField({ name: 'date', title: 'Data', type: 'datetime' }),
        defineField({ name: 'title', title: 'Titolo', type: 'localeString' }),
        defineField({ name: 'ctaUrl', title: 'URL CTA', type: 'url' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'siteName' },
  },
})
