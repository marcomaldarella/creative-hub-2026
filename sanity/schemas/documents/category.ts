import { defineField, defineType } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Categoria magazine',
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
  ],
  preview: {
    select: { title: 'title.it', subtitle: 'slug.current' },
  },
})
