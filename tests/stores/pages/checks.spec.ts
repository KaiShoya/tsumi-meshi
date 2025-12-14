import { describe, it, expect, vi } from 'vitest'
import { useChecksPageStore } from '~/stores/pages/checks'
import { apiClient } from '~/utils/api/client'

vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getCheckStats: vi.fn()
  }
}))

const showDangerToast = vi.fn()
vi.mock('~/composables/useAppToast', () => ({ useAppToast: () => ({ showDangerToast }) }))

describe('checks page store', () => {
  it('fetchStats returns stats on success', async () => {
    const mocked = apiClient.getCheckStats as unknown as vi.Mock
    mocked.mockResolvedValue({ totalChecks: 10, periodChecks: 3 })

    const store = useChecksPageStore()
    const res = await store.fetchStats('month')

    expect(res.totalChecks).toBe(10)
    expect(res.periodChecks).toBe(3)
  })

  it('fetchStats handles errors and returns defaults (logs and toast)', async () => {
    const mocked = apiClient.getCheckStats as unknown as vi.Mock
    mocked.mockRejectedValue(new Error('API down'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const store = useChecksPageStore()
    const res = await store.fetchStats('month')

    expect(res.totalChecks).toBe(0)
    expect(res.periodChecks).toBe(0)
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(showDangerToast).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
