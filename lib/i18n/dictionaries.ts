import type { Locale } from './config'
import it from './it.json'
import en from './en.json'

const dictionaries = { it, en } as const

export type Dictionary = typeof it

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
