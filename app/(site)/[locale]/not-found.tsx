import Link from 'next/link'

/** 404 brandizzata: FreeFat gigante, bilingue, link alla home */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        textAlign: 'center',
        padding: 'var(--pad)',
      }}
    >
      <span className="mono" style={{ color: 'var(--azzurro)' }}>
        errore · error
      </span>
      <h1
        className="display-black"
        style={{ fontSize: 'clamp(120px, 26vw, 380px)', lineHeight: 0.8 }}
      >
        404
      </h1>
      <p style={{ color: 'var(--fg-2)', maxWidth: '38ch' }}>
        Questa pagina non esiste o è stata spostata.
        <br />
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 10,
          padding: '12px 26px',
          border: '1px solid var(--azzurro)',
          borderRadius: 'var(--radius-pill)',
          color: 'var(--azzurro)',
          fontSize: 'var(--fs-small)',
          fontWeight: 500,
        }}
      >
        torna alla home →
      </Link>
    </main>
  )
}
