/**
 * Flip della migrazione sale → ScuolaSemplice (24/11):
 * aggiorna siteSettings.shopUrl in Sanity al pannello pubblico del
 * gestionale (le CTA generiche "shop" del sito). La parte permalink dei
 * bottoni prenota è governata dalla env NEXT_PUBLIC_SS_BOOKING_URL su
 * Vercel (va settata a parte, poi redeploy).
 *
 * Uso: node scripts/flip-booking-ss.mjs [--revert]
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@sanity/client'

const SS_URL = 'https://creativehub.scuolasemplice.it/register/public/dNCiPvhyh9'
const WOO_URL = 'https://bologna-creativehub.it/negozio/'
const revert = process.argv.includes('--revert')

const token = JSON.parse(
  readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8')
).authToken
const client = createClient({
  projectId: 'if3942oc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const url = revert ? WOO_URL : SS_URL
await client.patch('siteSettings').set({ shopUrl: url }).commit()
console.log(`siteSettings.shopUrl → ${url}`)
console.log(
  revert
    ? 'Ricorda: vercel env rm NEXT_PUBLIC_SS_BOOKING_URL production && vercel --prod'
    : `Ricorda: printf '${SS_URL}' | vercel env add NEXT_PUBLIC_SS_BOOKING_URL production && vercel --prod --yes`
)
