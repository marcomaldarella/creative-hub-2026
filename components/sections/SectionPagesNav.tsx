import Link from 'next/link'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { ScrollerRow } from '@/components/ui'
import styles from './SectionPagesNav.module.css'

/**
 * Barra sticky delle pagine di sezione (dai mockup ott 2026): sotto
 * l'hero di ogni pagina innovazione/studio, elenca le sorelle della
 * sezione con la voce corrente accesa. Le etichette vengono dal
 * dizionario nav.sub (stesso ordine delle ancore in SiteChrome).
 */

type Base = '/innovazione' | '/studios' | '/coworking'

/* percorsi per voce, nello stesso ordine di nav.sub[key].items */
const PATHS: Record<Base, string[]> = {
  '/innovazione': [
    '/innovazione/incubazione-accelerazione',
    '/innovazione/aziende',
    '/innovazione/bandi',
    '/innovazione/cte-cobo',
  ],
  '/studios': [
    '/studios/registrazione',
    '/studios/mix-mastering',
    '/studios/dolby-atmos',
    '/studios/sound-design',
    '/studios/podcast',
    '/studios/affitto-studio',
  ],
  /* coworking: le tre pagine dei mockup, la indice compresa — il menu
     di sezione del sito nuovo non elenca più studio e metaverso */
  '/coworking': ['/coworking', '/coworking/sale-eventi', '/coworking/prenota'],
}

export function SectionPagesNav({
  locale,
  base,
  current,
}: {
  locale: Locale
  base: Base
  current: string
}) {
  const t = getDictionary(locale)
  const isStudio = base === '/studios'
  const isCoworking = base === '/coworking'
  const label = isStudio
    ? 'Creative Hub SSL Recording Studio'
    : isCoworking
      ? t.coworking.subnavLabel
      : `Creative Hub · ${t.nav.innovation}`

  /* il coworking elenca le sue tre pagine (indice compresa); studio e
     innovazione mettono la indice davanti alle pagine figlie */
  const items: { label: string; path: string }[] = isCoworking
    ? t.coworking.subnavPages.map((lbl, i) => ({
        label: lbl,
        path: PATHS[base][i],
      }))
    : [
        { label: isStudio ? t.nav.studio : t.nav.innovation, path: base },
        ...(isStudio
          ? t.nav.sub.studio.items
          : t.nav.sub.innovation.items
        ).map((lbl, i) => ({ label: lbl, path: PATHS[base][i] })),
      ]

  return (
    <div
      className={styles.bar}
      style={
        /* accento della voce attiva: il colore della sezione dove c'è,
           bianco sulle altre */
        {
          '--pn-accent': isStudio
            ? 'var(--arancio)'
            : isCoworking
              ? 'var(--giallo-fluo)'
              : '#ffffff',
        } as React.CSSProperties
      }
    >
      <div className={`wrap ${styles.in}`}>
        <span className={styles.label}>{label}</span>
        {/* fila di voci: stessa grammatica dello subnav delle schede
            corso — scorre senza barra di sistema e sfuma al taglio di
            destra (solo quando sborda davvero) */}
        <ScrollerRow className={styles.row} aria-label={label}>
          {items.map((it) => (
            <Link
              key={it.path}
              href={localeHref(locale, it.path)}
              className={it.path === current ? styles.on : undefined}
              aria-current={it.path === current ? 'page' : undefined}
            >
              <span className={styles.slash}>/</span>
              <span>{it.label}</span>
            </Link>
          ))}
        </ScrollerRow>
      </div>
    </div>
  )
}
