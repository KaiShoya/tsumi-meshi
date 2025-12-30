// https://nuxt.com/docs/api/configuration/nuxt-config
/* eslint-disable nuxt/nuxt-config-keys-order */

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxt/ui',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  nitro: {
    prerender: {
      autoSubfolderIndex: false
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  i18n: {
    vueI18n: './i18n/i18n.config.ts',
    locales: [
      { code: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'en', name: 'English(US)', file: 'en.json' }
    ],
    defaultLocale: 'ja',
    langDir: 'locales/',
    strategy: 'prefix_except_default' // https://v8.i18n.nuxtjs.org/guide/routing-strategies
  },

  vite: {
    plugins: [
      {
        name: 'vue-spec-plugin',
        enforce: 'pre',
        async load(id) {
          if (!id || typeof id !== 'string') return null
          // Intercept SFC custom <spec lang="md"> blocks which Vite exposes
          // as virtual modules like `file.vue?vue&type=spec&index=0&lang.md`.
          if (id.includes('?vue&type=spec') && id.includes('&lang.md')) {
            const fs = (await import('f' + 's')) as { readFileSync: (path: string, enc: string) => string }
            const file = String(id.split('?')[0])
            try {
              const src = fs.readFileSync(file, 'utf-8')
              const m = src.match(/<spec\s+lang=["']md["'][^>]*>([\s\S]*?)<\/spec>/)
              const content = m && m[1] ? m[1].trim() : ''
              return `export default ${JSON.stringify(content)}`
            } catch {
              // If reading fails, return empty spec to avoid breaking the build
              return `export default ${JSON.stringify('')}`
            }
          }
          return null
        }
      }
    ]
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
