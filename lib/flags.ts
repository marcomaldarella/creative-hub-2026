/**
 * Interruttori di contenuto del sito.
 *
 * Servono a tenere fuori dalla navigazione una sezione che esiste ma non
 * è ancora pronta da mostrare: le route restano in piedi (chi ha il link
 * la apre), ma non compare nel menu, nel footer, nelle fasce di rimando
 * né nella sitemap, e dice ai motori di non indicizzarla.
 */

/** Editorial/magazine: nascosto su richiesta del cliente (ott 2026) */
export const EDITORIAL_ATTIVO = false
