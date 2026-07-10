import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import { client } from './client'

const builder = createImageUrlBuilder(client)

/** Costruisce l'URL di un'immagine Sanity: urlFor(image).width(1200).url() */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
