import { describe, it, expect, vi } from 'vitest'
import { useFoldersPageStore } from '~/stores/pages/folders'
import { useFoldersStore } from '~/stores/data/folders'

const internal = { fetchFolders: vi.fn(), createFolder: vi.fn(), updateFolder: vi.fn(), deleteFolder: vi.fn() }
vi.mock('~/stores/data/folders', () => ({ useFoldersStore: () => internal }))

const showDangerToast = vi.fn()
const showSuccessToast = vi.fn()
vi.mock('~/composables/useAppToast', () => ({ useAppToast: () => ({ showSuccessToast, showDangerToast }) }))

const logger = { error: vi.fn() }
vi.mock('~/composables/useLogger', () => ({ useLogger: () => logger }))

describe('folders page store', () => {
  it('fetchFolders handles errors with toast and logging', async () => {
    const internal = useFoldersStore()
    ;(internal.fetchFolders as unknown as vi.Mock).mockRejectedValue(new Error('API down'))

    const store = useFoldersPageStore()
    await store.fetchFolders()

    expect(logger.error).toHaveBeenCalled()
    expect(showDangerToast).toHaveBeenCalledWith('フォルダの読み込みに失敗しました')
  })
})
