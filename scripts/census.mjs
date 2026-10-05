import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('/Users/marcomaldarella/creative-hub-2026/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: env.SANITY_API_TOKEN || env.SANITY_TOKEN || env.SANITY_API_READ_TOKEN,
  apiVersion: '2026-01-01', useCdn: false,
})

const counts = await client.fetch(`{
  "types": array::unique(*[]._type),
}`)
console.log('=== TIPI PRESENTI ===')
for (const t of counts.types.sort()) {
  const n = await client.fetch(`count(*[_type == $t])`, { t })
  console.log(`${String(n).padStart(4)}  ${t}`)
}

console.log('\n=== CORSI (demo = senza coverImage) ===')
const courses = await client.fetch(`*[_type=="course"]|order(title.it asc){
  "t": title.it, "slug": slug.current, "cover": defined(coverImage),
  "gal": count(gallery), types, "cat": category->title.it, featured,
  "teachers": count(teachers), "hasBody": defined(body),
  "hasSkills": count(skills) > 0, "shopUrl": shopUrl, "id": _id
}`)
for (const c of courses) console.log(
  `${c.cover ? 'OK ' : 'DEMO'} | ${(c.t||'?').slice(0,42).padEnd(42)} | ${String(c.id).slice(0,28).padEnd(28)} | types:${JSON.stringify(c.types)} cat:${c.cat} gal:${c.gal ?? 0} doc:${c.teachers ?? 0} feat:${c.featured ? 'Y' : ''} shop:${c.shopUrl ? 'Y' : ''}`)

console.log('\n=== DOCENTI (demo = senza photo) ===')
const teachers = await client.fetch(`{"tot": count(*[_type=="teacher"]), "nophoto": *[_type=="teacher" && !defined(photo)]{name, _id}, "norole": count(*[_type=="teacher" && !defined(role)]), "nobio": count(*[_type=="teacher" && !defined(bio)])}`)
console.log('tot:', teachers.tot, '| senza ruolo:', teachers.norole, '| senza bio:', teachers.nobio)
console.log('senza foto:', teachers.nophoto.map(t => `${t.name} (${t._id})`).join(', ') || 'nessuno')

console.log('\n=== ARTICOLI ===')
const arts = await client.fetch(`*[_type=="article"]|order(publishedAt desc){"t": title.it, "slug": slug.current, publishedAt, "cover": defined(coverImage), "cats": categories[]->slug.current, "author": author->name}`)
for (const a of arts) console.log(`${a.cover ? 'img' : '—  '} | ${(a.publishedAt||'').slice(0,10)} | ${(a.t||'?').slice(0,50).padEnd(50)} | ${JSON.stringify(a.cats)} | ${a.author}`)

console.log('\n=== CATEGORIE MAGAZINE / CORSI / AUTORI / PARTNER ===')
console.log('category:', JSON.stringify(await client.fetch(`*[_type=="category"]{"t":title.it,"s":slug.current}`)))
console.log('courseCategory:', JSON.stringify(await client.fetch(`*[_type=="courseCategory"]{"t":title.it,"s":slug.current, "n": count(*[_type=="course" && references(^._id)])}`)))
console.log('author:', JSON.stringify(await client.fetch(`*[_type=="author"]{name, "n": count(*[_type=="article" && references(^._id)])}`)))
console.log('partner:', JSON.stringify(await client.fetch(`*[_type=="partner"]|order(order asc){name, order, "logo": defined(logo), url}`)))

console.log('\n=== SPAZI ===')
console.log(JSON.stringify(await client.fetch(`*[_type=="space"]|order(order asc){"t":title.it, kind, order, "imgs": count(images), "feat": count(features)}`), null, 1))

console.log('\n=== PAGE DOCS ===')
console.log(JSON.stringify(await client.fetch(`*[_type=="page"]{pageId, "heroTitle": hero.title.it, "sections": count(sections)}`), null, 1))

console.log('\n=== SITE SETTINGS ===')
console.log(JSON.stringify(await client.fetch(`*[_type=="siteSettings"][0]`), null, 1).slice(0, 1200))

console.log('\n=== ASSET ===')
const assets = await client.fetch(`{"imgs": count(*[_type=="sanity.imageAsset"]), "orphans": count(*[_type=="sanity.imageAsset" && count(*[references(^._id)])==0]), "files": count(*[_type=="sanity.fileAsset"]), "noalt": count(*[_type=="sanity.imageAsset" && !defined(altText)])}`)
console.log(JSON.stringify(assets))

console.log('\n=== DRAFTS ===')
console.log(JSON.stringify(await client.fetch(`*[_id in path("drafts.**")]{_id, _type}`)))
