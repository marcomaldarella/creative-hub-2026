import type { StructureResolver } from 'sanity/structure'

/** Struttura dello studio: singleton in cima, poi gruppi tematici. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenuti')
    .items([
      S.listItem()
        .title('Impostazioni sito')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Impostazioni sito')
        ),
      S.divider(),
      S.listItem()
        .title('Academy')
        .child(
          S.list()
            .title('Academy')
            .items([
              S.documentTypeListItem('course').title('Corsi'),
              S.documentTypeListItem('courseCategory').title('Categorie corsi'),
              S.documentTypeListItem('teacher').title('Docenti'),
            ])
        ),
      S.listItem()
        .title('Magazine')
        .child(
          S.list()
            .title('Magazine')
            .items([
              S.documentTypeListItem('article').title('Articoli'),
              S.documentTypeListItem('category').title('Categorie'),
              S.documentTypeListItem('author').title('Autori'),
            ])
        ),
      S.documentTypeListItem('space').title('Spazi'),
      S.documentTypeListItem('partner').title('Partner'),
      S.documentTypeListItem('page').title('Pagine'),
    ])
