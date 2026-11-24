import { defineField, defineType } from 'sanity'

/** Richiesta arrivata da un form del sito: copia di consultazione
 *  scritta da /api/contact (il lead vero vive in ScuolaSemplice).
 *  Tutto readOnly: qui si legge, non si edita. */
export const formSubmission = defineType({
  name: 'formSubmission',
  title: 'Richiesta dal form',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({
      name: 'form',
      title: 'Form',
      description:
        'Quale form del sito: contact, openday, lezione, avvisami, booking, booking-studio, evento.',
      type: 'string',
    }),
    defineField({ name: 'name', title: 'Nome', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Telefono', type: 'string' }),
    defineField({
      name: 'body',
      title: 'Contenuto',
      description: 'Tutti i campi del form, una riga per voce.',
      type: 'text',
    }),
    defineField({
      name: 'date',
      title: 'Data di invio',
      type: 'datetime',
    }),
    defineField({
      name: 'syncedToCrm',
      title: 'Nel CRM ScuolaSemplice',
      description: 'Spuntato se il lead è entrato anche nel gestionale.',
      type: 'boolean',
    }),
  ],
  orderings: [
    {
      title: 'Più recenti',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'name', form: 'form', date: 'date' },
    prepare({ title, form, date }) {
      const when = date
        ? new Date(date).toLocaleString('it-IT', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : ''
      return { title: title || '(senza nome)', subtitle: `${form ?? ''} · ${when}` }
    },
  },
})
