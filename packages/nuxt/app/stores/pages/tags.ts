import { defineStore } from 'pinia'
import { useTagsStore } from '~/stores/data/tags'
import { useAppToast } from '~/composables/useAppToast'
import { useLogger } from '~/composables/useLogger'
import type { TagInput } from '~/types/tags'

export const useTagsPageStore = defineStore('tagsPage', () => {
  const tagsStore = useTagsStore()
  const { showSuccessToast, showDangerToast } = useAppToast()
  const logger = useLogger()

  const fetchTags = async () => {
    try {
      await tagsStore.fetchTags()
    } catch (err: unknown) {
      logger.error('Failed to fetch tags', { module: 'tagsPage' }, err instanceof Error ? err : new Error(String(err)))
      showDangerToast('タグの読み込みに失敗しました')
    }
  }

  const createTag = async (input: TagInput) => {
    try {
      await tagsStore.createTag(input)
      showSuccessToast('タグを作成しました')
      await fetchTags()
    } catch (err: unknown) {
      logger.error('Failed to create tag', { module: 'tagsPage' }, err instanceof Error ? err : new Error(String(err)))
      showDangerToast('タグの作成に失敗しました')
    }
  }

  const updateTag = async (id: number, name: string) => {
    try {
      await tagsStore.updateTag(id, name)
      showSuccessToast('タグを更新しました')
      await fetchTags()
    } catch (err: unknown) {
      logger.error('Failed to update tag', { module: 'tagsPage', tagId: id }, err instanceof Error ? err : new Error(String(err)))
      showDangerToast('タグの更新に失敗しました')
    }
  }

  const deleteTag = async (id: number) => {
    try {
      await tagsStore.deleteTag(id)
      showSuccessToast('タグを削除しました')
      await fetchTags()
    } catch (err: unknown) {
      logger.error('Failed to delete tag', { module: 'tagsPage', tagId: id }, err instanceof Error ? err : new Error(String(err)))
      showDangerToast('タグの削除に失敗しました')
    }
  }

  return {
    fetchTags,
    createTag,
    updateTag,
    deleteTag
  }
})
