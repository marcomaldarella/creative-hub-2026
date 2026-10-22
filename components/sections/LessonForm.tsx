'use client'

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { Arrow } from '@/components/ui'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import styles from './LessonForm.module.css'

export type LessonFormLabels = Dictionary['lesson']['form']
/** quale set di opzioni "Da dove parti?" mostrare */
export type LessonVariant = 'strumento' | 'canto' | 'produzione'

export const LESSON_FORM_ANCHOR = 'prenota'
const WA_HREF = 'https://wa.me/393518431456'

/* ————— store condiviso —————
 * Il form è montato due volte (zona alta + chiusura) e viene prefillato
 * dai bottoni delle card pacchetto e dai ritratti insegnanti: le scelte
 * vivono in uno store di modulo (come il `pref` dei mockup), le istanze
 * si sottoscrivono con useSyncExternalStore. Lo step e i campi di testo
 * restano locali all'istanza. */
type Prefs = {
  /** slug del corso: al cambio pagina lo store si azzera */
  course: string
  mode: 'sede' | 'online' | null
  level: string | null
  teacher: string | null
  plan: string | null
  channel: 'whatsapp' | 'telefono'
}

const EMPTY: Omit<Prefs, 'course'> = {
  mode: null,
  level: null,
  teacher: null,
  plan: null,
  channel: 'whatsapp',
}

let prefs: Prefs = { course: '', ...EMPTY }
const subs = new Set<() => void>()

function setPrefs(next: Partial<Prefs>) {
  prefs = { ...prefs, ...next }
  subs.forEach((fn) => fn())
}

function subscribe(fn: () => void) {
  subs.add(fn)
  return () => {
    subs.delete(fn)
  }
}

const getPrefs = () => prefs

function scrollToForm() {
  document
    .getElementById(LESSON_FORM_ANCHOR)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Bottone che prefilla il form (insegnante dai ritratti, pacchetto dalle
 * card prezzo) e scrolla all'istanza in alto.
 */
export function LessonPrefill({
  teacher,
  plan,
  className,
  ariaLabel,
  children,
}: {
  teacher?: string
  /** stringa vuota = lezione di prova (nessun pacchetto) */
  plan?: string
  className?: string
  ariaLabel?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        const next: Partial<Prefs> = {}
        if (teacher !== undefined) next.teacher = teacher || null
        if (plan !== undefined) next.plan = plan || null
        setPrefs(next)
        scrollToForm()
      }}
    >
      {children}
    </button>
  )
}

/* spunta disegnata: mai ✓ unicode */
function Check({ size = 12 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2.8 8.6 6.4 12l6.8-8" />
    </svg>
  )
}

/**
 * Prenotazione lezione gratuita in due passi (dal formTpl dei mockup):
 * passo 1 solo tap (dove + da dove parti), passo 2 contatti, passo 3
 * conferma — che compare solo dopo la risposta ok di /api/contact.
 */
export function LessonForm({
  labels,
  variant,
  courseTitle,
  courseSlug,
  privacyHref,
}: {
  labels: LessonFormLabels
  variant: LessonVariant
  courseTitle: string
  courseSlug: string
  privacyHref: string
}) {
  const p = useSyncExternalStore(subscribe, getPrefs, getPrefs)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('')
  const [tried, setTried] = useState(false)
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent' | 'error'>(
    'idle'
  )

  /* lo store di modulo sopravvive alle navigazioni client:
     su un corso nuovo riparte pulito */
  useEffect(() => {
    if (prefs.course !== courseSlug) setPrefs({ course: courseSlug, ...EMPTY })
  }, [courseSlug])

  const levels = labels.levels[variant]
  const errName = tried && !name.trim()
  const errPhone = tried && !phone.trim()

  const modeShort = p.mode === 'sede' ? labels.inPerson : labels.online
  const levelShort = levels.find((lv) => lv.v === p.level)?.short
  const ctxBits = [
    p.mode ? modeShort : null,
    levelShort ?? null,
    p.teacher ? `${labels.withTeacher} ${p.teacher}` : null,
    p.plan ? `${labels.withPlan} ${p.plan}` : null,
  ].filter(Boolean)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (step !== 2) return
    setTried(true)
    if (status === 'pending') return
    if (!name.trim() || !phone.trim()) return

    const levelLabel = levels.find((lv) => lv.v === p.level)?.label ?? ''
    setStatus('pending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'lezione',
          subject: `${labels.subject} — ${courseTitle}`,
          /* chiavi fisse in italiano: diventano le righe dell'email */
          fields: {
            corso: courseTitle,
            /* da quale landing arriva la richiesta */
            pagina:
              typeof window !== 'undefined'
                ? window.location.pathname
                : `/academy/${courseSlug}`,
            modalita: modeShort,
            livello: levelLabel,
            ...(p.teacher ? { insegnante: p.teacher } : {}),
            ...(p.plan ? { pacchetto: p.plan } : {}),
            nome: name.trim(),
            cellulare: phone.trim(),
            email: email.trim(),
            canale:
              p.channel === 'whatsapp' ? labels.whatsapp : labels.phoneCall,
            _hp: hp,
          },
        }),
      })
      const data = (await res.json()) as { ok?: boolean }
      if (data.ok) {
        setStatus('sent')
        setStep(3)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  /* opzione a tap: bottone-riga, selezionata = pieno */
  const opt = (
    on: boolean,
    onPick: () => void,
    label: string,
    note?: string
  ) => (
    <button
      key={label}
      type="button"
      className={[styles.opt, on ? styles.on : ''].filter(Boolean).join(' ')}
      aria-pressed={on}
      onClick={onPick}
    >
      <span>{label}</span>
      {note && <small className={styles.optNote}>{note}</small>}
    </button>
  )

  return (
    <form className={styles.card} onSubmit={onSubmit} noValidate>
      <div className={styles.top}>
        <h3 className={styles.title}>{labels.title}</h3>
        {step < 3 && (
          <span className={`mono ${styles.progress}`}>
            {labels.stepLabel} {step} {labels.stepOf}
          </span>
        )}
      </div>
      <div className={styles.bar} aria-hidden="true">
        <i
          className={styles.barFill}
          style={{ transform: step === 1 ? 'scaleX(0.5)' : 'scaleX(1)' }}
        />
      </div>

      {step === 1 && (
        <div>
          <p className={styles.q}>{labels.whereLegend}</p>
          <div className={styles.optsTwo}>
            {opt(
              p.mode === 'sede',
              () => setPrefs({ mode: 'sede' }),
              labels.inPerson,
              labels.inPersonNote
            )}
            {opt(
              p.mode === 'online',
              () => setPrefs({ mode: 'online' }),
              labels.online,
              labels.onlineNote
            )}
          </div>
          <p className={styles.q}>{labels.levelLegend}</p>
          <div className={styles.opts}>
            {levels.map((lv) =>
              opt(p.level === lv.v, () => setPrefs({ level: lv.v }), lv.label)
            )}
          </div>
          <button
            type="button"
            className={styles.go}
            disabled={!p.mode || !p.level}
            onClick={() => setStep(2)}
          >
            {labels.continue} <Arrow size={12} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className={styles.ctx}>
            {ctxBits.join(' · ')}
            {' — '}
            <button
              type="button"
              className={styles.ctxEdit}
              onClick={() => setStep(1)}
            >
              {labels.edit}
            </button>
          </p>
          <div className={styles.fields}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{labels.nameLabel}</span>
              <input
                type="text"
                name="nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
                required
                aria-required="true"
                aria-invalid={errName || undefined}
                className={errName ? styles.errIn : undefined}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{labels.phoneLabel}</span>
              <input
                type="tel"
                name="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
                aria-required="true"
                aria-invalid={errPhone || undefined}
                className={errPhone ? styles.errIn : undefined}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                {labels.emailLabel}{' '}
                <span className={styles.fieldNote}>{labels.emailNote}</span>
              </span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
          </div>
          <p className={styles.q}>{labels.channelLegend}</p>
          <div className={styles.optsTwo}>
            {opt(
              p.channel === 'whatsapp',
              () => setPrefs({ channel: 'whatsapp' }),
              labels.whatsapp
            )}
            {opt(
              p.channel === 'telefono',
              () => setPrefs({ channel: 'telefono' }),
              labels.phoneCall
            )}
          </div>

          {/* honeypot: invisibile alle persone, compilato dai bot */}
          <label className={styles.hp} aria-hidden="true">
            <span>Lascia vuoto questo campo</span>
            <input
              type="text"
              name="_hp"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>

          {(errName || errPhone) && (
            <p className={styles.errMsg} role="alert">
              {labels.error}
            </p>
          )}
          <button
            type="submit"
            className={styles.go}
            disabled={status === 'pending'}
          >
            {labels.submit}
          </button>
          {status === 'error' && (
            <p className={styles.errMsg} role="alert">
              {labels.sendError}
            </p>
          )}
          <p className={styles.privacy}>
            {labels.privacyPrefix}
            <Link href={privacyHref}>{labels.privacyLink}</Link>
            {labels.privacySuffix}
          </p>
        </div>
      )}

      {step === 3 && (
        <div className={styles.done} role="status">
          <span className={styles.doneMark}>
            <Check size={22} />
          </span>
          <h4 className={styles.doneTitle}>{labels.doneTitle}</h4>
          <p className={styles.doneText}>{labels.doneText}</p>
          <ol className={styles.doneSteps}>
            {labels.doneSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {step < 3 && (
        <>
          <div className={styles.reassure}>
            {labels.reassure.map((r) => (
              <span key={r}>
                <Check size={11} /> {r}
              </span>
            ))}
          </div>
          <div className={styles.waLine}>
            <span>{labels.waPrompt}</span>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer">
              {labels.waLabel} <Arrow size={11} />
            </a>
          </div>
        </>
      )}
    </form>
  )
}
