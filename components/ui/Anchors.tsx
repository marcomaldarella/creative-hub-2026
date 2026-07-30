/**
 * Ancore invisibili per le voci del mega-menu che non hanno (ancora) una
 * sezione dedicata nella pagina. Se l'ancora di un link #hash non esiste,
 * Next non scrolla affatto e si atterra alla posizione della pagina
 * precedente (il "salto al footer"): questi span garantiscono che ogni
 * voce del menu abbia sempre un bersaglio.
 */
export function Anchors({ ids }: { ids: string[] }) {
  return (
    <div aria-hidden="true" style={{ position: 'relative', height: 0 }}>
      {ids.map((id) => (
        <span key={id} id={id} style={{ position: 'absolute', top: 0 }} />
      ))}
    </div>
  )
}
