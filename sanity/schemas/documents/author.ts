import { defineField, defineType } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Autore',
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
      name: 'photo',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role.it', media: 'photo' },
  },
})
