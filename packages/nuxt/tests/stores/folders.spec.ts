import { describe, it, expect, vi } from 'vitest'
import { useFoldersStore } from '~/stores/data/folders'
import { apiClient } from '~/utils/api/client'

vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getFolders: vi.fn(),
    createFolder: vi.fn(),
    updateFolder: vi.fn(),
    deleteFolder: vi.fn()
  }
}))

describe('folders store', () => {
  it('fetches folders and sets state', async () => {
    const mocked = apiClient.getFolders as unknown as vi.Mock
    mocked.mockResolvedValue({ folders: [{ id: 1, name: 'Inbox' }] })

    const store = useFoldersStore()
    await store.fetchFolders()

    expect(store.folders.length).toBe(1)
    expect(store.folders[0].name).toBe('Inbox')
  })

  it('creates a folder and adds to state', async () => {
    const mocked = apiClient.createFolder as unknown as vi.Mock
    mocked.mockResolvedValue({ folder: { id: 2, name: 'Recipes' } })

    const store = useFoldersStore()
    await store.createFolder({ name: 'Recipes' })

    expect(store.folders.find(f => f.id === 2)?.name).toBe('Recipes')
  })
})
