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
          /* voci di menu: il corpo lungo del TopicScreen (pageId = slug) */
          { title: 'Academy — Stage & placement', value: 'stage-placement' },
          { title: 'Academy — Servizi studenti', value: 'servizi-studenti' },
          { title: 'Academy — Open day', value: 'open-day' },
          { title: 'Academy — Formazione finanziata', value: 'formazione-finanziata' },
          { title: 'Studio — Dolby Atmos', value: 'dolby-atmos' },
          { title: 'Studio — Sound design', value: 'sound-design' },
          { title: 'Studio — Podcast & voice over', value: 'podcast' },
          { title: 'Coworking — Sale & eventi', value: 'sale-eventi' },
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
            defineField({
              name: 'anchor',
              title: 'Ancora',
              description:
                "Senza #: dà alla sezione un id a cui puntare da una griglia indice (es. soldi)",
              type: 'string',
            }),
            defineField({
              name: 'brief',
              title: 'In breve',
              description:
                'Riassunto in due righe: compare come box scuro in testa alla sezione',
              type: 'localeText',
            }),
            defineField({ name: 'body', title: 'Contenuto', type: 'localeBlock' }),
            defineField({
              name: 'ctas',
              title: 'Azioni',
              description:
                'I rimandi in coda alla sezione: il primo è un bottone, gli altri link con freccia. Percorso interno (es. /academy/open-day, anche con ancora) o indirizzo completo.',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'pageSectionCta',
                  title: 'Azione',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Etichetta',
                      type: 'localeString',
                    }),
                    defineField({
                      name: 'href',
                      title: 'Destinazione',
                      type: 'string',
                    }),
                  ],
                  preview: { select: { title: 'label.it', subtitle: 'href' } },
                },
              ],
            }),
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
