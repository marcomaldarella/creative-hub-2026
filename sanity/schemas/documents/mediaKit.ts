import { defineField, defineType } from 'sanity'

/** Archivio dei media "di produzione" del sito (video hero, foto di
 *  sezione): i file veri vivono in public/ nel repo, qui c'è una copia
 *  scaricabile per chi lavora su presentazioni e materiali. */
export const mediaKit = defineType({
  name: 'mediaKit',
  title: 'Archivio media',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      title: 'Nota',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'array',
      of: [
        {
          type: 'file',
          options: { accept: 'video/mp4,video/*' },
          fields: [
            defineField({ name: 'label', title: 'Etichetta', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'foto',
      title: 'Foto',
      type: 'array',
      of: [
        {
          type: 'image',
          fields: [
            defineField({ name: 'label', title: 'Etichetta', type: 'string' }),
          ],
        },
      ],
    }),
  ],
})
