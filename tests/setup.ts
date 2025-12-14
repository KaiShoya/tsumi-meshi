import { beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import * as vue from 'vue'

type VueHelpers = {
  ref: typeof vue.ref
  computed: typeof vue.computed
  readonly: typeof vue.readonly
  onMounted: typeof vue.onMounted
}

// Make Nuxt-style auto-imported Vue helpers available globally for tests
const g = globalThis as unknown as Partial<VueHelpers>
g.ref = vue.ref
g.computed = vue.computed
g.readonly = vue.readonly
g.onMounted = vue.onMounted

beforeEach(() => {
  setActivePinia(createPinia())
})
