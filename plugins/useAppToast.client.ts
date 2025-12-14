import { defineNuxtPlugin } from '#app'
import useToast from '@nuxt/ui'
import { useAppToast } from '~/composables/useAppToast'

export default defineNuxtPlugin(() => {
  try {
    const api = useToast()
    useAppToast().setAppToast(api)
  } catch {
    // ignore when Nuxt UI is not available (e.g., tests)
  }
})
