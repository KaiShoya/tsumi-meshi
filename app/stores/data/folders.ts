import { defineStore } from 'pinia'
import { useRecipesStore } from './recipes'
import { apiClient } from '~/utils/api/client'
import type { Folder, FolderInput, FolderUpdate } from '~/types/folders'

export const useFoldersStore = defineStore('folders', () => {
  const folders = ref<Folder[]>([])
  const loading = ref(false)
  const recipesStore = useRecipesStore()

  const fetchFolders = async () => {
    loading.value = true
    try {
      const data = await apiClient.getFolders()
      folders.value = (data.folders || []) as Folder[]
    } finally {
      loading.value = false
    }
  }

  const createFolder = async (payload: FolderInput) => {
    const { folder } = await apiClient.createFolder(payload)
    if (folder) folders.value.push(folder as Folder)
    return folder as Folder
  }

  const updateFolder = async (id: number, payload: FolderUpdate) => {
    const { folder } = await apiClient.updateFolder(id, payload)
    // After update, refetch to ensure canonical state
    await fetchFolders()
    return folder as Folder
  }

  const deleteFolder = async (id: number) => {
    await apiClient.deleteFolder(id)
    folders.value = folders.value.filter(f => f.id !== id)
    // Also update recipes that were in this folder.
    // This method might not exist on the store, so we check for it.
    if ('handleFolderDeletion' in recipesStore && typeof recipesStore.handleFolderDeletion === 'function') {
      (recipesStore.handleFolderDeletion as (folderId: number) => void)(id)
    }
  }

  return {
    folders,
    loading: readonly(loading),
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder
  }
})
