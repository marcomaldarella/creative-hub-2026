import { defineField, defineType } from 'sanity'

/** Stringa localizzata: it obbligatorio, en opzionale */
export const localeString = defineType({
  name: 'localeString',
  title: 'Stringa localizzata',
  type: 'object',
  fields: [
    defineField({
      name: 'it',
      title: 'Italiano',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'Inglese',
      type: 'string',
    }),
  ],
})

/** Testo lungo localizzato */
export const localeText = defineType({
  name: 'localeText',
  title: 'Testo localizzato',
  type: 'object',
  fields: [
    defineField({
      name: 'it',
      title: 'Italiano',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'Inglese',
      type: 'text',
      rows: 4,
    }),
  ],
})

/** Contenuto ricco (portable text + immagini) localizzato */
export const localeBlock = defineType({
  name: 'localeBlock',
  title: 'Contenuto localizzato',
  type: 'object',
  fields: [
    defineField({
      name: 'it',
      title: 'Italiano',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'en',
      title: 'Inglese',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
  ],
})
