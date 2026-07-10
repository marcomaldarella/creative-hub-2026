import { defineField, defineType } from 'sanity'

export const courseCategory = defineType({
  name: 'courseCategory',
  title: 'Categoria corso',
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
