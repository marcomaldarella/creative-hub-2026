import { localeString, localeText, localeBlock } from './objects/locale'
import {
  chipList,
  contactList,
  contactRow,
  contentTable,
  indexCard,
  indexGrid,
  noteBox,
  tableRow,
} from './objects/content'
import { siteSettings } from './documents/siteSettings'
import { teacher } from './documents/teacher'
import { courseCategory } from './documents/courseCategory'
import { course } from './documents/course'
import { author } from './documents/author'
import { category } from './documents/category'
import { article } from './documents/article'
import { partner } from './documents/partner'
import { space } from './documents/space'
import { page } from './documents/page'

export const schemaTypes = [
  // oggetti
  localeString,
  localeText,
  localeBlock,
  tableRow,
  contentTable,
  chipList,
  indexCard,
  indexGrid,
  noteBox,
  contactRow,
  contactList,
  // documenti
  siteSettings,
  teacher,
  courseCategory,
  course,
  author,
  category,
  article,
  partner,
  space,
  page,
]
