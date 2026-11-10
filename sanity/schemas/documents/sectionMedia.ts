import { defineField, defineType } from 'sanity'

/** Foto delle pagine di sezione (hero, bande fotografiche): ogni documento
 *  copre una pagina e ogni voce è uno "slot" con l'etichetta di dove si
 *  vede sul sito. Gli slot li definisce il codice: qui si SOSTITUISCE
 *  l'immagine, non si aggiungono posti nuovi. Senza immagine (o senza
 *  documento) la pagina usa la foto di repo di sempre. */
export const sectionMedia = defineType({
  name: 'sectionMedia',
  title: 'Media di sezione',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Pagina',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'pageId',
      title: 'Id pagina (non toccare)',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slots',
      title: 'Foto della pagina',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'mediaSlot',
          fields: [
            defineField({
              name: 'slot',
              title: 'Id slot (non toccare)',
              type: 'string',
              readOnly: true,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Dove si vede',
              type: 'string',
              readOnly: true,
            }),
            defineField({
              name: 'image',
              title: 'Immagine',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'slot', media: 'image' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'pageId' },
  },
})
