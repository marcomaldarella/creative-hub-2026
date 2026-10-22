import { Button } from '@/components/ui'
import styles from './MobileBookBar.module.css'

/**
 * Barra prenota fissa in basso su mobile, come chiedono le note dei
 * mockup coworking: il riquadro di prenotazione sta a destra sul
 * desktop e diventa una barra in basso sul telefono. Prezzo a sinistra,
 * tasto a destra. Server component: non ha stato.
 */
export function MobileBookBar({
  from,
  price,
  unit,
  cta,
  href,
}: {
  /** "da" */
  from?: string
  /** il prezzo, in evidenza */
  price: string
  /** "al giorno" e simili */
  unit?: string
  cta: string
  href: string
}) {
  return (
    <div className={styles.bar}>
      <span className={styles.price}>
        {from ? `${from} ` : ''}
        <b>{price}</b>
        {unit ? ` ${unit}` : ''}
      </span>
      <Button variant="azzurro" href={href}>
        {cta}
      </Button>
    </div>
  )
}
