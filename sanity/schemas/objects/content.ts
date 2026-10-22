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

/**
 * Riquadro nota: un'etichetta breve e un testo dentro una scheda chiara.
 * Serve ai blocchi che nel mockup stanno in una card bianca a sé — il
 * caso vero è il paragrafo "in English" dei servizi studenti, che va
 * marcato anche con la lingua (`lang`) per i lettori di schermo.
 */
export const noteBox = defineType({
  name: 'noteBox',
  title: 'Riquadro nota',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Etichetta',
      description: 'Riga breve in testa al riquadro, es. in English',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Testo',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lang',
      title: 'Lingua del testo',
      description:
        "Codice lingua se il testo NON è nella lingua della pagina, es. en. Serve ai lettori di schermo.",
      type: 'string',
    }),
  ],
  preview: {
    select: { label: 'label', text: 'text' },
    prepare: ({ label, text }: { label?: string; text?: string }) => ({
      title: label || 'Riquadro nota',
      subtitle: text,
    }),
  },
})

/**
 * Una voce dei contatti: etichetta minuscola, recapito in evidenza e
 * nota di servizio sotto. L'indirizzo (`href`) rende il recapito
 * cliccabile — tel:, mailto:, https://wa.me/…
 */
export const contactRow = defineType({
  name: 'contactRow',
  title: 'Recapito',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Etichetta',
      description: 'es. telefono, whatsapp, email',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Recapito',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Indirizzo',
      description: 'tel:+39…, mailto:…, https://wa.me/… — lascia vuoto per un recapito non cliccabile',
      type: 'string',
    }),
    defineField({ name: 'note', title: 'Nota', type: 'string' }),
  ],
  preview: {
    select: { label: 'label', value: 'value' },
    prepare: ({ label, value }: { label?: string; value?: string }) => ({
      title: value || 'Recapito',
      subtitle: label,
    }),
  },
})

/**
 * I recapiti in fila: la fascia di chiusura delle pagine organizzate per
 * bisogni (mockup servizi studenti) — tre colonne su fondo scuro.
 */
export const contactList = defineType({
  name: 'contactList',
  title: 'Recapiti',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Voci',
      type: 'array',
      of: [{ type: 'contactRow' }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare: ({ items }: { items?: { label?: string }[] }) => ({
      title: 'Recapiti',
      subtitle: (items ?? []).map((it) => it.label).filter(Boolean).join(' · '),
    }),
  },
})
