import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFoldersStore } from '~/stores/data/folders'
import { apiClient } from '~/utils/api/client'
import { useRecipesStore } from '~/stores/data/recipes'

// Mock apiClient
const mockFoldersList = [{ id: 1, name: 'Folder 1' }, { id: 2, name: 'Folder 2' }]
vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getFolders: vi.fn(async () => ({ folders: mockFoldersList })),
    createFolder: vi.fn(async ({ name, parentId }: { name: string, parentId?: number | null }) => ({ folder: { name, parentId, id: 3 } })),
    updateFolder: vi.fn(async (id: number, body: Partial<{ name: string, parentId?: number | null }>) => ({ folder: { id, ...(body as object) } })),
    deleteFolder: vi.fn(async (_id: number) => ({ success: true }))
  }
}))

const mockRecipesStore = {
  handleFolderDeletion: vi.fn()
}
vi.mock('~/stores/data/recipes', () => ({
  useRecipesStore: vi.fn(() => mockRecipesStore)
}))

describe('~/stores/data/folders.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches folders and updates state', async () => {
    const store = useFoldersStore()
    expect(store.folders).toEqual([])
    expect(store.loading).toBe(false)

    await store.fetchFolders()

    expect(store.loading).toBe(false)
    expect(store.folders).toEqual(mockFoldersList)
  })

  it('creates a folder and adds it to the state', async () => {
    const store = useFoldersStore()
    const newFolderPayload = { name: 'New Folder', parentId: 1 }

    await store.createFolder(newFolderPayload)

    expect(store.folders).toHaveLength(1)
    expect(store.folders[0]).toEqual({ ...newFolderPayload, id: 3 })
  })

  it('updates a folder and refetches', async () => {
    const store = useFoldersStore()
    store.folders = [...mockFoldersList]
    const updatePayload = { name: 'Updated Name' }

    await store.updateFolder(1, updatePayload)

    // It refetches, so the mock will return the original list
    expect(store.folders).toEqual(mockFoldersList)
    expect(vi.mocked(apiClient.updateFolder)).toHaveBeenCalledWith(1, updatePayload)
    expect(vi.mocked(apiClient.getFolders)).toHaveBeenCalled()
  })

  it('deletes a folder and calls recipe store handler', async () => {
    const recipesStore = useRecipesStore()
    const store = useFoldersStore()
    store.folders = [...mockFoldersList]

    await store.deleteFolder(1)

    expect(store.folders).toHaveLength(1)
    expect(store.folders[0].id).toBe(2)
    expect(recipesStore.handleFolderDeletion).toHaveBeenCalledWith(1)
  })
})
