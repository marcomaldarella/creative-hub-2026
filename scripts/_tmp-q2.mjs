import { readFileSync } from 'node:fs'
import { createClient } from '@sanity/client'
const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim() }
const c = createClient({ projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: 'production', token: env.SANITY_API_TOKEN, apiVersion: '2026-07-01', useCdn: false })
console.log('CATEGORIES:', JSON.stringify(await c.fetch(`*[_type=="courseCategory"]{_id,title,"slug":slug.current,order}|order(order asc)`), null, 1))
console.log('COURSE COUNT:', await c.fetch(`count(*[_type=="course"])`))
console.log('ALL SLUGS:', JSON.stringify(await c.fetch(`*[_type=="course"]{"s":slug.current,"c":category->slug.current,types}|order(s asc)`)))
