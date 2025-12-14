import { describe, it, expect, vi } from 'vitest'
import { useChecksStore } from '~/stores/data/checks'
import { apiClient } from '~/utils/api/client'

vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getChecks: vi.fn()
  }
}))

describe('checks store', () => {
  it('fetches checks for a recipe', async () => {
    const mocked = apiClient.getChecks as unknown as vi.Mock
    mocked.mockResolvedValue({ checks: [{ id: 1, createdAt: new Date().toISOString() }] })

    const store = useChecksStore()
    await store.fetchChecks(1)

    expect(store.checks.length).toBe(1)
  })
})
