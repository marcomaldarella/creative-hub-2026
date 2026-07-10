import { defineField, defineType } from 'sanity'

export const course = defineType({
  name: 'course',
  title: 'Corso',
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
      name: 'category',
      title: 'Categoria',
      type: 'reference',
      to: [{ type: 'courseCategory' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'teachers',
      title: 'Docenti',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'teacher' }] }],
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
      name: 'coverImage',
      title: 'Immagine di copertina',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'duration',
      title: 'Durata',
      type: 'localeString',
    }),
    defineField({
      name: 'startDate',
      title: 'Inizio',
      description: 'Testo libero, es. "ottobre 2026".',
      type: 'localeString',
    }),
    defineField({
      name: 'level',
      title: 'Livello',
      type: 'localeString',
    }),
    defineField({
      name: 'mode',
      title: 'Modalità',
      description: 'In sede / ibrido / online.',
      type: 'localeString',
    }),
    defineField({
      name: 'language',
      title: 'Lingua del corso',
      type: 'localeString',
    }),
    defineField({
      name: 'shopUrl',
      title: 'URL iscrizione (override)',
      type: 'url',
      description: 'Se impostato, sostituisce lo shopUrl generale per il CTA di iscrizione.',
    }),
    defineField({
      name: 'featured',
      title: 'In evidenza',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title.it', subtitle: 'category.title.it', media: 'coverImage' },
  },
})
