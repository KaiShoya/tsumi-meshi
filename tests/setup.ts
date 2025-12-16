import { beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { config } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createI18n } from 'vue-i18n'
import ja from '../i18n/locales/ja.json'
import en from '../i18n/locales/en.json'

// No global shim required: auto-imports configured for tests// Keep Pinia activation here
beforeEach(() => {
  setActivePinia(createPinia())
})

// Register lightweight global stubs for Nuxt UI components used in templates
const stubNames = [
  'UForm',
  'UFormGroup',
  'UInput',
  'UButton',
  'USelectMenu',
  'UCard',
  'UBadge',
  'UDropdown',
  'UHeader',
  'UMain',
  'UIcon',
  'UApp',
  'UFooter',
  'USeparator',
  'UColorModeButton'
]

for (const name of stubNames) {
  config.global.components![name] = defineComponent({
    name,
    inheritAttrs: true,
    setup(_, { slots, attrs }) {
      return () => h('div', attrs as unknown as Record<string, unknown>, slots.default ? slots.default() : null)
    }
  })
  // also kebab-case
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  config.global.components![kebab] = config.global.components![name]
}

// Provide vue-i18n plugin for test environment so `useI18n()` works
const i18n = createI18n({
  legacy: false,
  locale: 'ja',
  messages: { ja, en }
})
config.global.plugins = config.global.plugins || []
config.global.plugins.push(i18n)
