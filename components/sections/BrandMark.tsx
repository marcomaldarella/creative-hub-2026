import styles from './BrandMark.module.css'

/* I marchi dell'attrezzatura: file, altezza in pixel e rapporto del
   viewBox. L'altezza è per marchio perché le tele degli SVG sono molto
   diverse (alcuni export hanno un margine interno largo, altri no): con
   una misura unica uno sparisce e l'altro domina. Il rapporto serve a
   dare al riquadro una larghezza vera — una maschera senza larghezza
   collassa a zero e il logo non si vede. */
const MARKS: Record<string, [file: string, height: number, ratio: number]> = {
  ssl: ['solid-state-logic-bianco.svg', 24, 498.22 / 103.57],
  dolby: ['dolby-bianco.svg', 84, 560 / 400],
  genelec: ['genelec-bianco.svg', 19, 58.848 / 10.094],
  universalAudio: ['universal-audio-bianco.svg', 40, 92 / 66],
  avid: ['avid-bianco.svg', 78, 560 / 400],
  ableton: ['ableton-bianco.svg', 68, 560 / 400],
  ikMultimedia: ['ik-multimedia-bianco.svg', 20, 2829 / 795],
  filmCommission: ['emilia-romagna-film-commission-bianco.svg', 58, 611 / 674],
}

export type BrandId = keyof typeof MARKS

/** nome leggibile per chi usa uno screen reader: il logo è un'immagine */
const NAMES: Record<BrandId, string> = {
  ssl: 'Solid State Logic',
  dolby: 'Dolby',
  genelec: 'Genelec',
  universalAudio: 'Universal Audio',
  avid: 'Avid',
  ableton: 'Ableton',
  ikMultimedia: 'IK Multimedia',
  filmCommission: 'Emilia-Romagna Film Commission',
}

export type BrandMarkProps = {
  brand: BrandId
  /** forza l'altezza quando il contesto chiede un marchio più grande */
  height?: number
  className?: string
}

/** Un singolo marchio, disegnato come maschera riempita di currentColor. */
export function BrandMark({ brand, height, className }: BrandMarkProps) {
  const [file, h, ratio] = MARKS[brand]
  const url = `url(/img/partners-studio/${file})`
  const px = height ?? h
  return (
    <span
      role="img"
      aria-label={NAMES[brand]}
      className={[styles.mark, className].filter(Boolean).join(' ')}
      style={{
        maskImage: url,
        WebkitMaskImage: url,
        height: `${px}px`,
        width: `${Math.round(px * ratio)}px`,
      }}
    />
  )
}

/** Una riga di marchi sopra una hairline: l'attrezzatura di uno spazio. */
export function BrandRow({ brands, className }: { brands: BrandId[]; className?: string }) {
  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')}>
      {brands.map((b) => (
        <BrandMark key={b} brand={b} />
      ))}
    </div>
  )
}
