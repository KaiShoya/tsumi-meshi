import { defineStore } from 'pinia'
import { apiClient } from '~/utils/api/client'
import type { Folder } from '~/repositories/folders'

export const useFoldersStore = defineStore('folders', () => {
  const folders = ref<Folder[]>([])
  const loading = ref(false)

  const fetchFolders = async () => {
    loading.value = true
    try {
      const res = await apiClient.getFolders()
      folders.value = (res.folders as Folder[]) || []
    } finally {
      loading.value = false
    }
  }

  const createFolder = async (payload: { name: string; parentId?: number | null }) => {
    const res = await apiClient.createFolder(payload)
    if (res.folder) {
      folders.value.push(res.folder as Folder)
    }
    return res.folder
  }

  const updateFolder = async (id: number, payload: { name?: string; parentId?: number | null }) => {
    const res = await apiClient.updateFolder(id, payload)
    if (res.folder) {
      const idx = folders.value.findIndex(f => f.id === id)
      if (idx !== -1) folders.value[idx] = res.folder as Folder
    }
    return res.folder
  }

  const deleteFolder = async (id: number) => {
    await apiClient.deleteFolder(id)
    folders.value = folders.value.filter(f => f.id !== id)
  }

  return {
    folders: readonly(folders),
    loading: readonly(loading),
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder
  }
})
