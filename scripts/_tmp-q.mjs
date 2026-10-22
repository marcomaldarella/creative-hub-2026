import { readFileSync } from 'node:fs'
import { createClient } from '@sanity/client'
const root = '/Users/marcomaldarella/creative-hub-2026'
const env = {}
for (const line of readFileSync(root + '/.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim()
}
const client = createClient({ projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production', token: env.SANITY_API_TOKEN, apiVersion: '2026-07-01', useCdn: false })
const all = await client.fetch(`*[_type=="course"]{_id,"slug":slug.current,"t":title.it,types,admissionsKeys}|order(slug asc)`)
for (const c of all) console.log(c._id.padEnd(40), (c.slug||'').padEnd(42), (c.types||[]).join('+').padEnd(12), c.t)
console.log('\n=== admissionsKeys dei custom ===')
for (const c of all.filter(c=>c.types?.includes('custom'))) {
  console.log(c.slug, JSON.stringify((c.admissionsKeys||[]).map(k=>k.it)))
}
