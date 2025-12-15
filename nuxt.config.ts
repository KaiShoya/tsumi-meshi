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
          // Intercept SFC custom <spec lang="md"> blocks which Vite exposes
          // as virtual modules like `file.vue?vue&type=spec&index=0&lang.md`.
          if (id.includes('?vue&type=spec') && id.includes('&lang.md')) {
            const fs = await import('fs')
            const file = id.split('?')[0]
            try {
              const src = fs.readFileSync(file, 'utf-8')
              const m = src.match(/<spec\s+lang=["']md["'][^>]*>([\s\S]*?)<\/spec>/)
              const content = m ? m[1].trim() : ''
              return `export default ${JSON.stringify(content)}`
            } catch (e) {
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
