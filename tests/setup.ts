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

// Provide simple stubs for Nuxt auto-imports used by code under test
type NuxtTestState = Map<string, { value: unknown }>
interface TestGlobals {
  __nuxt_test_state__?: NuxtTestState
  useState?: (key: string, factory: unknown) => { value: unknown } | undefined
  definePageMeta?: (meta: unknown) => void
  defineNuxtRouteMiddleware?: (fn: (to: { path: string, fullPath: string, query: Record<string, unknown> }) => unknown) => unknown
}

const tg = globalThis as unknown as TestGlobals
tg.__nuxt_test_state__ = tg.__nuxt_test_state__ || new Map<string, { value: unknown }>()
tg.useState = (key: string, factory: unknown) => {
  const map = tg.__nuxt_test_state__ as NuxtTestState
  if (!map.has(key)) {
    const initial = typeof factory === 'function' ? (factory as () => unknown)() : factory
    map.set(key, { value: initial })
  }
  return map.get(key)
}

// No-op page meta helper for tests
tg.definePageMeta = (_meta: unknown) => {}

// Nuxt route middleware wrapper stub: return the provided handler so tests can import middleware modules
tg.defineNuxtRouteMiddleware = (fn: (to: { path: string, fullPath: string, query: Record<string, unknown> }) => unknown) => fn

// Register lightweight global stubs for Nuxt UI components used in templates
const stubNames = [
  'UForm',
  'UFormField',
  'UInput',
  'UButton',
  'USelectMenu',
  'UCard',
  'UBadge',
  'UDropdownMenu',
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
