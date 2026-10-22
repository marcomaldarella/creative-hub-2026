import { defineField, defineType } from 'sanity'

/**
 * Tabella di contenuto dentro il corpo localizzato (localeBlock): header
 * con filo, righe hairline — il renderer è in TopicScreen/PortableBlocks,
 * stessa grammatica della tabella formule del coworking. Le righe sono
 * oggetti (Sanity non ammette array di array): ogni riga porta le sue
 * celle nell'ordine delle colonne.
 */
export const tableRow = defineType({
  name: 'tableRow',
  title: 'Riga',
  type: 'object',
  fields: [
    defineField({
      name: 'cells',
      title: 'Celle',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { cells: 'cells' },
    prepare: ({ cells }: { cells?: string[] }) => ({
      title: (cells ?? []).join(' · '),
    }),
  },
})

export const contentTable = defineType({
  name: 'contentTable',
  title: 'Tabella',
  type: 'object',
  fields: [
    defineField({ name: 'caption', title: 'Didascalia', type: 'string' }),
    defineField({
      name: 'columns',
      title: 'Colonne',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.min(2).max(4),
    }),
    defineField({
      name: 'rows',
      title: 'Righe',
      type: 'array',
      of: [{ type: 'tableRow' }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { caption: 'caption', columns: 'columns' },
    prepare: ({ caption, columns }: { caption?: string; columns?: string[] }) => ({
      title: caption || 'Tabella',
      subtitle: (columns ?? []).join(' · '),
    }),
  },
})

/**
 * Fila di chip con etichetta mono opzionale (es. le sedi Erasmus, i nomi
 * del Label Lab): pill hairline in riga, mai elenco puntato.
 */
export const chipList = defineType({
  name: 'chipList',
  title: 'Chip',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Etichetta', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Voci',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { label: 'label', items: 'items' },
    prepare: ({ label, items }: { label?: string; items?: string[] }) => ({
      title: label || 'Chip',
      subtitle: (items ?? []).join(' · '),
    }),
  },
})

/**
 * Card di una griglia indice: numero di servizio (es. ss.01), titolo,
 * riga di spiegazione e l'ancora della sezione a cui porta.
 */
export const indexCard = defineType({
  name: 'indexCard',
  title: 'Card indice',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Numero',
      description: 'Sigla mono in testa alla card, es. ss.01',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'text', title: 'Riga', type: 'string' }),
    defineField({
      name: 'anchor',
      title: 'Ancora',
      description: "Ancora della sezione a cui porta, senza #, es. soldi",
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', label: 'label', anchor: 'anchor' },
    prepare: ({
      title,
      label,
      anchor,
    }: {
      title?: string
      label?: string
      anchor?: string
    }) => ({
      title: [label, title].filter(Boolean).join(' · '),
      subtitle: anchor ? `#${anchor}` : undefined,
    }),
  },
})

/**
 * Griglia indice: le card d'apertura di una pagina organizzata per
 * bisogni (es. servizi studenti), ognuna ancorata alla sua sezione.
 * Il renderer è in TopicScreen, stessa grammatica hairline delle celle.
 */
export const indexGrid = defineType({
  name: 'indexGrid',
  title: 'Griglia indice',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Card',
      type: 'array',
      of: [{ type: 'indexCard' }],
      validation: (rule) => rule.min(2),
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare: ({ items }: { items?: { title?: string }[] }) => ({
      title: 'Griglia indice',
      subtitle: (items ?? []).map((it) => it.title).filter(Boolean).join(' · '),
    }),
  },
})
