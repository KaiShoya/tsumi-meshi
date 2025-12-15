// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

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
            const file = id.split('?')[0]
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
