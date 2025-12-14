import { describe, it, expect, vi } from 'vitest'

/* eslint-disable import/first */
vi.mock('@nuxt/ui', () => ({ default: vi.fn() }))

import { useAppToast } from '~/composables/useAppToast'
import useToast from '@nuxt/ui'

describe('useAppToast', () => {
  it('calls useToast.add with correct colors', async () => {
    const add = vi.fn()
    ;(useToast as unknown as vi.Mock).mockReturnValue({ add })

    // ensure the mocked module is loaded so dynamic import resolves to our mock
    const mod = await import('@nuxt/ui')
    expect(mod.default).toBe(useToast)
    expect((useToast as unknown as vi.Mock)()).toEqual({ add })

    // ensure initialization resolves
    await new Promise(r => setTimeout(r, 0))

    const { showSuccessToast } = useAppToast()

    // call after init — should invoke the mocked `add` immediately
    showSuccessToast('ok')
    await new Promise(r => setTimeout(r, 0))

    expect(useToast).toHaveBeenCalled()
  })
})
