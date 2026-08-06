import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import { criticalScriptPlugin } from '@woowabros/vite-plugin-critical-script'
import { defineConfig } from 'astro/config'

import { cleanUrls } from './src/integrations/clean-urls'

const site = 'https://woowabros.github.io'
const base = '/critical-script/'
const repository = 'https://github.com/woowabros/critical-script'

export default defineConfig({
  base,
  // Extensionless URLs with no trailing slash. `file` writes en/getting-started.html
  // rather than en/getting-started/index.html, which GitHub Pages serves at
  // /en/getting-started. Note that this changes what relative links resolve against,
  // so internal links are written from the site root instead.
  build: { format: 'file' },
  integrations: [
    react(),
    starlight({
      components: {
        // Dark only: no selector, and no client script that could switch to light.
        ThemeProvider: './src/overrides/ThemeProvider.astro',
        ThemeSelect: './src/overrides/ThemeSelect.astro',
      },
      credits: false,
      customCss: ['./src/styles/tokens.css', './src/styles/custom.css'],
      defaultLocale: 'en',
      editLink: {
        baseUrl: `${repository}/edit/main/docs/critical-script/`,
      },
      // One dark syntax theme, so no light-mode rules ship at all. one-dark-pro keeps
      // enough hue separation to read on a near-neutral surface, and the chrome is
      // pinned to the palette so a block never looks like a foreign box on the page.
      expressiveCode: {
        styleOverrides: {
          borderColor: 'var(--code-line)',
          borderWidth: '1px',
          borderRadius: 'var(--radius-md)',
          codeBackground: 'var(--code-bg)',
          codeFontFamily: 'var(--font-mono)',
          frames: {
            editorActiveTabBackground: 'var(--code-bg)',
            editorActiveTabIndicatorTopColor: 'var(--brand)',
            editorTabBarBackground: 'var(--code-chrome)',
            editorTabBarBorderBottomColor: 'var(--code-line)',
            terminalBackground: 'var(--code-bg)',
            terminalTitlebarBackground: 'var(--code-chrome)',
            terminalTitlebarBorderBottomColor: 'var(--code-line)',
          },
          scrollbarThumbColor: 'var(--line-strong)',
          scrollbarThumbHoverColor: 'var(--ink-3)',
          uiFontFamily: 'var(--font-sans)',
        },
        themes: ['one-dark-pro'],
      },
      favicon: '/favicon.png',
      head: [
        { attrs: { content: `${site}${base}og.png`, property: 'og:image' }, tag: 'meta' },
        { attrs: { content: 'summary_large_image', name: 'twitter:card' }, tag: 'meta' },
      ],
      locales: {
        en: { label: 'English', lang: 'en' },
        ko: { label: '한국어', lang: 'ko' },
      },
      logo: { alt: '', src: './src/assets/mark.png' },
      // No search: the site is five pages per locale, and dropping it lets the
      // documentation header and the benchmark page's bar hold the same content.
      pagefind: false,
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
          items: [{ label: 'Side by side', link: '/benchmark', translations: { ko: '나란히 비교' } }],
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
    cleanUrls({ base, site }),
  ],
  site,
  trailingSlash: 'never',
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
