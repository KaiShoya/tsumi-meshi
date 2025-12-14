import { defineStore } from 'pinia'
import { useFoldersStore } from '~/stores/data/folders'
import { useAppToast } from '~/composables/useAppToast'
import type { FolderInput, FolderUpdate } from '~/repositories/folders'

export const useFoldersPageStore = defineStore('foldersPage', () => {
  const foldersStore = useFoldersStore()
  const { showSuccessToast, showDangerToast } = useAppToast()

  const fetchFolders = async () => {
    try {
      await foldersStore.fetchFolders()
    } catch (err: unknown) {
      console.error(err)
      showDangerToast('フォルダの読み込みに失敗しました')
    }
  }

  const createFolder = async (input: FolderInput) => {
    try {
      await foldersStore.createFolder(input)
      showSuccessToast('フォルダを作成しました')
      await fetchFolders()
    } catch (err: unknown) {
      console.error(err)
      showDangerToast('フォルダの作成に失敗しました')
    }
  }

  const updateFolder = async (id: number, input: FolderUpdate) => {
    try {
      await foldersStore.updateFolder(id, input)
      showSuccessToast('フォルダを更新しました')
      await fetchFolders()
    } catch (err: unknown) {
      console.error(err)
      showDangerToast('フォルダの更新に失敗しました')
    }
  }

  const deleteFolder = async (id: number) => {
    try {
      await foldersStore.deleteFolder(id)
      showSuccessToast('フォルダを削除しました')
      await fetchFolders()
    } catch (err: unknown) {
      console.error(err)
      showDangerToast('フォルダの削除に失敗しました')
    }
  }

  return {
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder
  }
})
