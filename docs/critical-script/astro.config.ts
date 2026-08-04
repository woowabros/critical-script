import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import { criticalScriptPlugin } from '@woowabros/vite-plugin-critical-script'
import { defineConfig } from 'astro/config'

const site = 'https://woowabros.github.io'
const base = '/critical-script/'
const repository = 'https://github.com/woowabros/critical-script'

export default defineConfig({
  base,
  integrations: [
    react(),
    starlight({
      credits: false,
      customCss: ['./src/styles/tokens.css', './src/styles/custom.css'],
      defaultLocale: 'en',
      editLink: {
        baseUrl: `${repository}/edit/main/docs/critical-script/`,
      },
      favicon: '/favicon.svg',
      head: [
        { attrs: { content: `${site}${base}og.png`, property: 'og:image' }, tag: 'meta' },
        { attrs: { content: 'summary_large_image', name: 'twitter:card' }, tag: 'meta' },
      ],
      locales: {
        en: { label: 'English', lang: 'en' },
        ko: { label: '한국어', lang: 'ko' },
      },
      sidebar: [
        {
          items: ['getting-started', 'design-philosophy', 'use-cases', 'caveats'],
          label: 'Guide',
          translations: { ko: '가이드' },
        },
        {
          items: ['api-reference'],
          label: 'Reference',
          translations: { ko: '레퍼런스' },
        },
        {
          // Its own route rather than a docs page, because the split view needs the
          // whole viewport and full control over each document's <head>.
          items: [{ label: 'Side by side', link: '/benchmark/', translations: { ko: '나란히 비교' } }],
          label: 'Benchmark',
          translations: { ko: '벤치마크' },
        },
      ],
      social: [{ href: repository, icon: 'github', label: 'GitHub' }],
      title: 'critical-script',
    }),
    // NOTE: mdx() must come after starlight(). Starlight bundles astro-expressive-code,
    // which requires registration before mdx() and fails the build otherwise.
    mdx(),
  ],
  site,
  vite: {
    plugins: [
      criticalScriptPlugin({
        define: {
          // The demo API lives under the GitHub Pages base path, and the inline script
          // is compiled by esbuild on its own, so it cannot read import.meta.env.
          __DEMO_API_URL__: JSON.stringify(`${base}api/home.json`),
        },
      }),
    ],
  },
})
