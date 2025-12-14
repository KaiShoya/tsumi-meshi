import { defineStore } from 'pinia'
import { useFoldersStore } from '~/stores/data/folders'
import { useAppToast } from '~/composables/useAppToast'
import { useLogger } from '~/composables/useLogger'
import type { FolderInput, FolderUpdate } from '~/repositories/folders'

export const useFoldersPageStore = defineStore('foldersPage', () => {
  const foldersStore = useFoldersStore()
  const { showSuccessToast, showDangerToast } = useAppToast()
  const logger = useLogger()

  const fetchFolders = async () => {
    try {
      await foldersStore.fetchFolders()
    } catch (err: unknown) {
      logger.error('Failed to fetch folders', { module: 'foldersPage' }, err instanceof Error ? err : new Error(String(err)))
      showDangerToast('フォルダの読み込みに失敗しました')
    }
  }

  const createFolder = async (input: FolderInput) => {
    try {
      await foldersStore.createFolder(input)
      showSuccessToast('フォルダを作成しました')
      await fetchFolders()
    } catch (err: unknown) {
      logger.error('Failed to create folder', { module: 'foldersPage' }, err instanceof Error ? err : new Error(String(err)))
      showDangerToast('フォルダの作成に失敗しました')
    }
  }

  const updateFolder = async (id: number, input: FolderUpdate) => {
    try {
      await foldersStore.updateFolder(id, input)
      showSuccessToast('フォルダを更新しました')
      await fetchFolders()
    } catch (err: unknown) {
      logger.error('Failed to update folder', { module: 'foldersPage', folderId: id }, err instanceof Error ? err : new Error(String(err)))
      showDangerToast('フォルダの更新に失敗しました')
    }
  }

  const deleteFolder = async (id: number) => {
    try {
      await foldersStore.deleteFolder(id)
      showSuccessToast('フォルダを削除しました')
      await fetchFolders()
    } catch (err: unknown) {
      logger.error('Failed to delete folder', { module: 'foldersPage', folderId: id }, err instanceof Error ? err : new Error(String(err)))
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
