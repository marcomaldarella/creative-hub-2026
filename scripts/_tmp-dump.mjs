import { readFileSync } from 'node:fs'
import { createClient } from '@sanity/client'
const root = '/Users/marcomaldarella/creative-hub-2026'
const env = {}
for (const line of readFileSync(root + '/.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim()
}
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: env.SANITY_API_TOKEN, apiVersion: '2026-07-01', useCdn: false,
})
const id = process.argv[2]
const page = await client.fetch('*[_type=="page" && pageId==$id][0]', { id })
if (!page) { console.log('NOT FOUND'); process.exit(0) }
console.log('_id', page._id, 'fields', Object.keys(page))
for (const s of page.sections ?? []) {
  console.log('\n### section', s._key, '| kicker:', JSON.stringify(s.kicker), '| title:', JSON.stringify(s.title))
  if (s.brief) console.log('   BRIEF:', JSON.stringify(s.brief))
  for (const b of s.body?.it ?? []) {
    if (b._type === 'block') {
      const txt = (b.children ?? []).map(c => c.text ?? '').join('')
      console.log(`   [${b._key}] ${b.style ?? 'normal'}${b.listItem ? '/'+b.listItem : ''}: ${txt}`)
    } else {
      console.log(`   [${b._key}] <${b._type}>`, JSON.stringify(b).slice(0, 300))
    }
  }
}
