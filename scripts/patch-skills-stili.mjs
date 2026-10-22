/**
 * Via la coda "Stili: …" / "Software: …" dall'ultima area di "cosa
 * impari" (ott 2026).
 *
 * Nei mockup HTML quella riga non sta dentro una card: è la fila di
 * chip sotto la griglia (ora resa dalla pagina lezione, testi nel
 * dizionario `lesson.styles.bySlug`). In Sanity era stata appiccicata
 * in fondo all'ultima card, quindi si leggeva due volte.
 *
 * IDEMPOTENTE: tocca solo i testi che hanno ancora quella coda.
 *
 * Uso: node scripts/patch-skills-stili.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [
      l.slice(0, l.indexOf('=')).trim(),
      l.slice(l.indexOf('=') + 1).trim(),
    ])
)

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: env.SANITY_API_TOKEN || env.SANITY_TOKEN || env.SANITY_API_READ_TOKEN,
  apiVersion: '2026-01-01',
  useCdn: false,
})

/* "… palco con altri musicisti. Stili: pop, rock, …." → via la coda */
const CODA = /\s*(?:Stili|Software|Styles)\s*:\s*[^.]*\.\s*$/

const courses = await client.fetch(
  `*[_type == "course" && "custom" in types && defined(skills)]{
     _id, "slug": slug.current, skills
   }`
)

let touched = 0
for (const course of courses) {
  const skills = course.skills ?? []
  let changed = false
  const next = skills.map((s) => {
    const out = { ...s }
    for (const lang of ['it', 'en']) {
      const v = s.text?.[lang]
      if (typeof v === 'string' && CODA.test(v)) {
        out.text = { ...out.text, [lang]: v.replace(CODA, '') }
        changed = true
      }
    }
    return out
  })
  if (!changed) {
    console.log(`= ${course.slug}: niente da togliere`)
    continue
  }
  if (!dryRun) await client.patch(course._id).set({ skills: next }).commit()
  touched += 1
  console.log(`+ ${course.slug}: coda stili/software rimossa`)
}
console.log(`${touched} corsi aggiornati${dryRun ? ' (dry run)' : ''}`)
