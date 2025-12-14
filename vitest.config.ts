import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'

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
      imports: ['vue'],
      dts: false
    })
  ]
})
