import { docsSchema } from '@astrojs/starlight/schema'
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'

export const collections = {
  docs: defineCollection({
    loader: glob({
      base: new URL('../..', import.meta.url),
      pattern: ['404.md', '{en,ko}/**/*.{md,mdx}'],
    }),
    schema: docsSchema(),
  }),
}
