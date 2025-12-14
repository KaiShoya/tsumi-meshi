import { beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// No global shim required: auto-imports configured for tests// Keep Pinia activation here
beforeEach(() => {
  setActivePinia(createPinia())
})
