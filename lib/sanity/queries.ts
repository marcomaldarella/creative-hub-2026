import { groq } from 'next-sanity'
import { client } from './client'
import type {
  Article,
  Category,
  Course,
  HomeData,
  Page,
  PageId,
  Partner,
  SiteSettings,
  Space,
  SpaceKind,
  Teacher,
} from './types'

/* ---------- frammenti ---------- */

const courseFields = groq`
  _id, _type, title, slug, summary, body, coverImage,
  duration, startDate, level, mode, language, shopUrl, featured, types,
  category->{ _id, _type, title, slug },
  teachers[]->{ _id, _type, name, slug, role, bio, photo, links }
`

const articleFields = groq`
  _id, _type, title, slug, excerpt, body, coverImage, publishedAt, featured,
  categories[]->{ _id, _type, title, slug },
  author->{ _id, _type, name, slug, role, photo }
`

/* ---------- query ---------- */

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]`

export function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(siteSettingsQuery)
}

export const allCoursesQuery = groq`
  *[_type == "course"] | order(title.it asc) { ${courseFields} }
`

export function getAllCourses(): Promise<Course[]> {
  return client.fetch(allCoursesQuery)
}

export const courseBySlugQuery = groq`
  *[_type == "course" && slug.current == $slug][0] { ${courseFields} }
`

export function getCourseBySlug(slug: string): Promise<Course | null> {
  return client.fetch(courseBySlugQuery, { slug })
}

export const allTeachersQuery = groq`
  *[_type == "teacher"] | order(name asc) {
    _id, _type, name, slug, role, bio, photo, links
  }
`

export function getAllTeachers(): Promise<Teacher[]> {
  return client.fetch(allTeachersQuery)
}

export const allArticlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc) { ${articleFields} }
`

export function getAllArticles(): Promise<Article[]> {
  return client.fetch(allArticlesQuery)
}

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] { ${articleFields} }
`

export function getArticleBySlug(slug: string): Promise<Article | null> {
  return client.fetch(articleBySlugQuery, { slug })
}

export const articlesByCategoryQuery = groq`
  *[_type == "article" && $categorySlug in categories[]->slug.current]
    | order(publishedAt desc) { ${articleFields} }
`

export function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  return client.fetch(articlesByCategoryQuery, { categorySlug })
}

export const allCategoriesQuery = groq`
  *[_type == "category"] | order(title.it asc) { _id, _type, title, slug }
`

export function getAllCategories(): Promise<Category[]> {
  return client.fetch(allCategoriesQuery)
}

export const allPartnersQuery = groq`
  *[_type == "partner"] | order(order asc) { _id, _type, name, logo, url, order }
`

export function getAllPartners(): Promise<Partner[]> {
  return client.fetch(allPartnersQuery)
}

export const spacesByKindQuery = groq`
  *[_type == "space" && kind == $kind] | order(order asc) {
    _id, _type, title, slug, kind, summary, body, features, images, order
  }
`

export function getSpacesByKind(kind: SpaceKind): Promise<Space[]> {
  return client.fetch(spacesByKindQuery, { kind })
}

export const pageByIdQuery = groq`
  *[_type == "page" && pageId == $pageId][0] {
    _id, _type, pageId, hero, sections
  }
`

export function getPageById(pageId: PageId): Promise<Page | null> {
  return client.fetch(pageByIdQuery, { pageId })
}

export const homeDataQuery = groq`{
  "settings": *[_type == "siteSettings"][0],
  "featuredCourses": *[_type == "course" && featured == true]
    | order(title.it asc) { ${courseFields} },
  "latestArticles": *[_type == "article"] | order(publishedAt desc)[0...3] {
    ${articleFields}
  },
  "partners": *[_type == "partner"] | order(order asc) {
    _id, _type, name, logo, url, order
  }
}`

export function getHomeData(): Promise<HomeData> {
  return client.fetch(homeDataQuery)
}
