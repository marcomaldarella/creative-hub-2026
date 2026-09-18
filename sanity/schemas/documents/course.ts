import { defineField, defineType } from 'sanity'

/* voce titolo+testo delle sezioni della scheda (competenze, accordion
   struttura/ammissioni/FAQ): nel testo un a-capo = nuovo paragrafo */
const schedaEntry = {
  type: 'object' as const,
  fields: [
    defineField({ name: 'title', title: 'Titolo', type: 'localeString' }),
    defineField({ name: 'text', title: 'Testo', type: 'localeText' }),
  ],
  preview: {
    select: { title: 'title.it', subtitle: 'text.it' },
  },
}

export const course = defineType({
  name: 'course',
  title: 'Corso',
  type: 'document',
  fieldsets: [
    {
      name: 'scheda',
      title: 'Scheda corso — sezioni',
      description:
        'Contenuti delle sezioni della pagina corso (competenze, struttura, ammissioni, FAQ). Le sezioni lasciate vuote mostrano la copy di default.',
      options: { collapsible: true, collapsed: true },
    },
  ],
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
      name: 'types',
      title: 'Tipologia',
      description: 'Filtri academy: triennio, magistrale, finanziato, gratuito, custom.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Triennio', value: 'triennio' },
          { title: 'Magistrale', value: 'magistrale' },
          { title: 'Finanziato', value: 'finanziato' },
          { title: 'Gratuito', value: 'gratuito' },
          { title: 'Custom', value: 'custom' },
        ],
        layout: 'grid',
      },
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
      name: 'gallery',
      title: 'Galleria',
      description: 'Altre foto del corso, oltre alla copertina.',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
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
      name: 'skillsLede',
      title: 'Competenze — sottotitolo',
      description: 'Il paragrafo sotto "Competenze che svilupperai".',
      type: 'localeText',
      fieldset: 'scheda',
    }),
    defineField({
      name: 'skills',
      title: 'Competenze',
      description:
        'Le card della griglia competenze (nella pagina demo sono 6). Le foto arrivano dalla galleria del corso.',
      type: 'array',
      of: [schedaEntry],
      fieldset: 'scheda',
    }),
    defineField({
      name: 'structureIntro',
      title: 'Struttura — introduzione',
      description:
        'I paragrafi a sinistra dell’accordion (un a-capo = nuovo paragrafo).',
      type: 'localeText',
      fieldset: 'scheda',
    }),
    defineField({
      name: 'structure',
      title: 'Struttura del corso',
      description: 'Le voci dell’accordion (es. Primo anno, Secondo anno…).',
      type: 'array',
      of: [schedaEntry],
      fieldset: 'scheda',
    }),
    defineField({
      name: 'admissionsKeys',
      title: 'Ammissioni — in breve',
      description: 'I punti elenco della colonna "In breve".',
      type: 'array',
      of: [{ type: 'localeString' }],
      fieldset: 'scheda',
    }),
    defineField({
      name: 'admissions',
      title: 'Ammissioni',
      description: 'Le voci dell’accordion ammissioni.',
      type: 'array',
      of: [schedaEntry],
      fieldset: 'scheda',
    }),
    defineField({
      name: 'faq',
      title: 'Domande frequenti',
      description: 'Domanda nel titolo, risposta nel testo.',
      type: 'array',
      of: [schedaEntry],
      fieldset: 'scheda',
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
