import { defineField, defineType } from 'sanity'

export const teacher = defineType({
  name: 'teacher',
  title: 'Docente',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Ruolo',
      type: 'localeString',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'localeText',
    }),
    defineField({
      name: 'photo',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video',
      description:
        'Facoltativo: link a un file .mp4 o a YouTube. Nelle lezioni su misura la foto diventa il poster e il video parte al clic.',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'links',
      title: 'Link',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'teacherLink',
          title: 'Link',
          fields: [
            defineField({ name: 'label', title: 'Etichetta', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role.it', media: 'photo' },
  },
})
