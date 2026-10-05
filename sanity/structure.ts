import type { StructureResolver } from 'sanity/structure'

/** Struttura dello studio (/admin): singleton in cima, poi i gruppi
 *  tematici nell'ordine delle sezioni del sito. I corsi hanno viste
 *  filtrate per tipologia (stesso campo `types` dei filtri di /academy).
 *  NB: il catalogo prenotabile (prezzi, day pass, sale) NON vive qui —
 *  arriva dalla Store API WooCommerce del sito WordPress (lib/woocommerce). */
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
              S.documentTypeListItem('course').title('Tutti i corsi'),
              S.listItem()
                .title('Corsi universitari')
                .id('corsi-universitari')
                .child(
                  S.documentList()
                    .title('Corsi universitari')
                    .filter(
                      '_type == "course" && ("triennio" in types || "magistrale" in types)'
                    )
                ),
              S.listItem()
                .title('Corsi custom')
                .id('corsi-custom')
                .child(
                  S.documentList()
                    .title('Corsi custom')
                    .filter('_type == "course" && "custom" in types')
                ),
              S.listItem()
                .title('Formazione finanziata')
                .id('corsi-finanziati')
                .child(
                  S.documentList()
                    .title('Formazione finanziata')
                    .filter(
                      '_type == "course" && ("finanziato" in types || "gratuito" in types)'
                    )
                ),
              S.divider(),
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
      S.listItem()
        .title('Spazi (studio & coworking)')
        .id('spazi')
        .child(
          S.list()
            .title('Spazi')
            .items([
              S.listItem()
                .title('Coworking')
                .id('spazi-coworking')
                .child(
                  S.documentList()
                    .title('Spazi coworking')
                    .filter('_type == "space" && kind == "coworking"')
                ),
              S.listItem()
                .title('Studio')
                .id('spazi-studio')
                .child(
                  S.documentList()
                    .title('Spazi studio')
                    .filter('_type == "space" && kind == "studio"')
                ),
              S.documentTypeListItem('space').title('Tutti gli spazi'),
            ])
        ),
      S.documentTypeListItem('partner').title('Partner'),
      S.documentTypeListItem('page').title('Pagine (hero & corpi)'),
    ])
