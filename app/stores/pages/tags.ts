// @ts-expect-error: Pinia types may not be available in typecheck environment
import { defineStore } from 'pinia'
import { useTagsStore } from '~/stores/data/tags'
import { useToast } from '~/composables/useToast'
import type { TagInput } from '~/repositories/tags'

export const useTagsPageStore = defineStore('tagsPage', () => {
  const tagsStore = useTagsStore()
  const { showSuccessToast, showDangerToast } = useToast()

  const fetchTags = async () => {
    try {
      await tagsStore.fetchTags()
    } catch (err: unknown) {
      console.error(err)
      showDangerToast('タグの読み込みに失敗しました')
    }
  }

  const createTag = async (input: TagInput) => {
    try {
      await tagsStore.createTag(input)
      showSuccessToast('タグを作成しました')
      await fetchTags()
    } catch (err: unknown) {
      console.error(err)
      showDangerToast('タグの作成に失敗しました')
    }
  }

  const updateTag = async (id: number, name: string) => {
    try {
      await tagsStore.updateTag(id, name)
      showSuccessToast('タグを更新しました')
      await fetchTags()
    } catch (err: unknown) {
      console.error(err)
      showDangerToast('タグの更新に失敗しました')
    }
  }

  const deleteTag = async (id: number) => {
    try {
      await tagsStore.deleteTag(id)
      showSuccessToast('タグを削除しました')
      await fetchTags()
    } catch (err: unknown) {
      console.error(err)
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
