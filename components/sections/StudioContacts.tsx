import { Reveal } from '@/components/ui'
import det from '@/components/sections/DetailPage.module.css'

type Notes = {
  phone?: string
  email?: string
  address: string
  addressNote?: string
}

/* colonna recapiti della sezione "prenota" (mockup studio): tre righe
   — telefono, email, indirizzo — ognuna con la sua nota sotto. Stesso
   blocco su tutte le pagine dello studio: prima era copiato a mano in
   sei file, con l'indirizzo annidato dentro il link mailto */
export function StudioContacts({
  email,
  phone,
  notes,
  delay = 160,
}: {
  email: string
  phone?: string
  notes: Notes
  delay?: number
}) {
  return (
    <Reveal className={det.mailRows} delay={delay}>
      {phone && (
        <a className={det.mailRow} href={`tel:${phone.replace(/\s/g, '')}`}>
          <span className={det.mailAddr}>{phone}</span>
          {notes.phone && <span className={det.mailNote}>{notes.phone}</span>}
        </a>
      )}
      <a className={det.mailRow} href={`mailto:${email}`}>
        <span className={det.mailAddr}>{email}</span>
        {notes.email && <span className={det.mailNote}>{notes.email}</span>}
      </a>
      <div className={det.mailRow}>
        <span className={det.mailAddr}>{notes.address}</span>
        {notes.addressNote && (
          <span className={det.mailNote}>{notes.addressNote}</span>
        )}
      </div>
    </Reveal>
  )
}
