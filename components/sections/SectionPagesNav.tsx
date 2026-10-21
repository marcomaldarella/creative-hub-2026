import Link from 'next/link'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import styles from './SectionPagesNav.module.css'

/**
 * Barra sticky delle pagine di sezione (dai mockup ott 2026): sotto
 * l'hero di ogni pagina innovazione/studio, elenca le sorelle della
 * sezione con la voce corrente accesa. Le etichette vengono dal
 * dizionario nav.sub (stesso ordine delle ancore in SiteChrome).
 */

type Base = '/innovazione' | '/studios'

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
  const label = isStudio
    ? 'Creative Hub SSL Recording Studio'
    : `Creative Hub · ${t.nav.innovation}`
  const rootLabel = isStudio ? t.nav.studio : t.nav.innovation
  const subItems = isStudio ? t.nav.sub.studio.items : t.nav.sub.innovation.items

  const items: { label: string; path: string }[] = [
    { label: rootLabel, path: base },
    ...subItems.map((lbl, i) => ({ label: lbl, path: PATHS[base][i] })),
  ]

  return (
    <div
      className={styles.bar}
      style={
        /* accento della voce attiva: arancio su studio, bianco altrove */
        { '--pn-accent': isStudio ? 'var(--arancio)' : '#ffffff' } as React.CSSProperties
      }
    >
      <div className={`wrap ${styles.in}`}>
        <span className={styles.label}>{label}</span>
        <nav className={styles.row} aria-label={label}>
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
        </nav>
      </div>
    </div>
  )
}
