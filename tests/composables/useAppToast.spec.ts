import { describe, it, expect, vi } from 'vitest'

/* eslint-disable import/first */
vi.mock('@nuxt/ui', () => ({ default: vi.fn() }))

import { useAppToast } from '~/composables/useAppToast'
import useToast from '@nuxt/ui'

describe('useAppToast', () => {
  it('calls useToast.add with correct colors', () => {
    const add = vi.fn()
    ;(useToast as unknown as vi.Mock).mockReturnValue({ add })

    const { showSuccessToast, showDangerToast, showInfoToast, showWarningToast } = useAppToast()

    showSuccessToast('ok')
    showDangerToast('err')
    showInfoToast('info')
    showWarningToast('warn')

    expect(add).toHaveBeenCalledWith({ description: 'ok', color: 'success' })
    expect(add).toHaveBeenCalledWith({ description: 'err', color: 'error' })
    expect(add).toHaveBeenCalledWith({ description: 'info', color: 'info' })
    expect(add).toHaveBeenCalledWith({ description: 'warn', color: 'warning' })
  })
})
