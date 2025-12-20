import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import vue from '@vitejs/plugin-vue'
import type { Plugin } from 'vite'

// During tests, SFC custom blocks with `lang="md"` (e.g. <spec lang="md">)
// may be requested as `?vue&type=spec&index=0&lang.md` and Vite/Rollup can
// attempt to parse them as JS modules, causing parse errors. Add a small
// Vite plugin for the test config that returns a no-op module for those ids.
function ignoreVueSpecBlocks() {
  return {
    name: 'ignore-vue-spec-blocks' as const,
    enforce: 'pre',
    transform(code: string, id: string) {
      try {
        if (id && /[?&]type=spec(?:&|$)/.test(id)) {
          // return an empty module so Rollup/Vite won't try to parse markdown
          return {
            code: 'export default {}',
            map: { mappings: '' }
          }
        }
      } catch {
        // noop
      }
      return null
    }
  } as Plugin
}

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts'
  },
  resolve: {
    alias: {
      // Map Nuxt-style ~ imports to the `app/` directory for tests
      '~/': fileURLToPath(new URL('./app/', import.meta.url)),
      '~': fileURLToPath(new URL('./app/', import.meta.url))
    }
  },
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-i18n'],
      dts: false
    }),
    ignoreVueSpecBlocks(),
    vue()
  ]
})
