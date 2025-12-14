import { beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import * as vue from 'vue'

// Make Nuxt-style auto-imported Vue helpers available globally for tests
;(globalThis as any).ref = vue.ref
;(globalThis as any).computed = vue.computed
;(globalThis as any).readonly = vue.readonly
;(globalThis as any).onMounted = vue.onMounted

beforeEach(() => {
  setActivePinia(createPinia())
})
