import { docsSchema } from '@astrojs/starlight/schema'
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'

export const collections = {
  docs: defineCollection({
    loader: glob({
      base: new URL('../..', import.meta.url),
      pattern: '{en,ko}/**/*.{md,mdx}',
    }),
    schema: docsSchema(),
  }),
}
