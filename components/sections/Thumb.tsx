import { urlFor } from '@/lib/sanity/image'
import type { SanityImage } from '@/lib/sanity/types'
import styles from './Thumb.module.css'

export type ThumbProps = {
  image?: SanityImage | null
  alt?: string
  /** varia il gradient di fallback (index % 3) */
  index?: number
  /** aspect-ratio CSS (default '3 / 2') */
  ratio?: string
  /** cerchio (per i ritratti docenti) */
  round?: boolean
  width?: number
  className?: string
}

const gradients = [styles.g0, styles.g1, styles.g2]

/**
 * Copertina con fallback: se l'immagine Sanity manca (il seed non carica
 * asset) mostra un placeholder con gradient sui token brand, come i .thumb
 * del reference.
 */
export function Thumb({
  image,
  alt = '',
  index = 0,
  ratio = '3 / 2',
  round = false,
  width = 1200,
  className,
}: ThumbProps) {
  const hasAsset = Boolean(image?.asset?._ref)
  const cls = [
    styles.thumb,
    round ? styles.round : '',
    hasAsset ? '' : gradients[Math.abs(index) % gradients.length],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls} style={{ aspectRatio: round ? '1 / 1' : ratio }}>
      {hasAsset && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          /* auto('format'): la CDN di Sanity serve webp/avif dove supportati */
          src={urlFor(image as SanityImage).width(width).auto('format').url()}
          alt={image?.alt ?? alt}
          loading="lazy"
        />
      )}
    </div>
  )
}
