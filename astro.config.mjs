import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'url'
import compress from 'astro-compress'
import icon from 'astro-icon'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// Vite configuration with path aliases and SCSS settings
const viteConfig = {
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [fileURLToPath(new URL('./src/assets', import.meta.url))],
        logger: {
          warn: () => {},
        },
      },
    },
  },
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@public': fileURLToPath(new URL('./public', import.meta.url)),
      '@post-images': fileURLToPath(new URL('./public/posts', import.meta.url)),
      '@project-images': fileURLToPath(new URL('./public/projects', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@theme-config': fileURLToPath(new URL('./theme.config.ts', import.meta.url)),
    },
  },
}

// Form confirmations and error pages excluded from the XML sitemap.
const excludedSitemapPaths = new Set([
  '/404',
  '/thank-you',
])
const excludedSitemapPrefixes = ['/projects/tag/']

// https://astro.build/config
export default defineConfig({
  prefetch: false,
  compressHTML: true,
  site: 'https://vinitshinde.netlify.app/',
  trailingSlash: 'never',
  build: {
    format: 'file'
  },
  integrations: [
    compress(),
    icon(),
    mdx(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/+$/, '') || '/'
        return (
          !excludedSitemapPaths.has(pathname) &&
          !excludedSitemapPrefixes.some((prefix) => pathname.startsWith(prefix))
        )
      },
    }),
  ],
  vite: viteConfig,
})
