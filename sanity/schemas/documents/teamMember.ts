import { defineField, defineType } from 'sanity'

/* lo staff dell'hub (pagina chi-siamo, "Le persone"): è un'anagrafica
   diversa dai docenti — fonte iniziale: bologna-creativehub.it/team */
export const teamMember = defineType({
  name: 'teamMember',
  title: 'Membro del team',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome',
      type: 'string',
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
    defineField({
      name: 'order',
      title: 'Ordine',
      description: 'Posizione nella griglia (1 = primo)',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Ordine griglia',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role.it', media: 'photo' },
  },
})
