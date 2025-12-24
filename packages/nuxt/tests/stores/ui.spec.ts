import { describe, it, expect } from 'vitest'
import { useUiStore } from '~/stores/ui'

describe('ui store', () => {
  it('toggles loading with refcount', () => {
    const store = useUiStore()
    expect(store.loading).toBe(false)
    store.showLoading()
    expect(store.loading).toBe(true)
    store.showLoading()
    expect(store.loading).toBe(true)
    store.hideLoading()
    expect(store.loading).toBe(true)
    store.hideLoading()
    expect(store.loading).toBe(false)
  })
})
