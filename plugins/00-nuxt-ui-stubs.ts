import { defineNuxtPlugin } from '#app'
import { defineComponent, h, type Component } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  // small runtime log to verify plugin load in dev server
  console.debug('[nuxt-ui-stubs] registering lightweight UI component stubs')
  const components = [
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

  const toKebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

  for (const name of components) {
    const kebab = toKebab(name)

    if (!nuxtApp.vueApp.component(name)) {
      nuxtApp.vueApp.component(
        name,
        defineComponent({
          name,
          inheritAttrs: true,
          setup(_, { slots, attrs }) {
            return () => h('div', attrs as unknown as Record<string, unknown>, slots.default ? slots.default() : null)
          }
        }) as unknown as Component
      )
    }

    if (!nuxtApp.vueApp.component(kebab)) {
      nuxtApp.vueApp.component(
        kebab,
        defineComponent({
          name: `${name}Kebab`,
          inheritAttrs: true,
          setup(_, { slots, attrs }) {
            return () => h('div', attrs as unknown as Record<string, unknown>, slots.default ? slots.default() : null)
          }
        }) as unknown as Component
      )
    }
  }
})
