import { describe, it, expect, vi } from 'vitest'
import { useRecipesPageStore } from '~/stores/pages/recipes'
import { apiClient } from '~/utils/api/client'

vi.mock('~/utils/api/client', () => ({ apiClient: { createCheck: vi.fn() } }))

const showDangerToast = vi.fn()
vi.mock('~/composables/useAppToast', () => ({ useAppToast: () => ({ showDangerToast }) }))

describe('recipes page store', () => {
  it('toggleCheck handles failures with toast and logging', async () => {
    const mocked = apiClient.createCheck as unknown as vi.Mock
    mocked.mockRejectedValue(new Error('API down'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const store = useRecipesPageStore()
    await store.toggleCheck(123)

    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(showDangerToast).toHaveBeenCalledWith('チェックの登録に失敗しました')

    consoleErrorSpy.mockRestore()
  })
})
