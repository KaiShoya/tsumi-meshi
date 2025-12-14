// @ts-expect-error: Pinia types may not be available in typecheck environment
import { defineStore } from 'pinia'
import type { Tag, TagInput } from '~/repositories/tags'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const loading = ref(false)

  const fetchTags = async () => {
    loading.value = true
    try {
      // TODO: Implement API call
      // tags.value = await apiClient.getTags()
      tags.value = []
    } finally {
      loading.value = false
    }
  }

  const createTag = async (tag: TagInput) => {
    // TODO: Implement API call
    console.log('Create tag:', tag)
  }

  const updateTag = async (id: number, name: string) => {
    // TODO: Implement API call
    console.log('Update tag:', id, name)
  }

  const deleteTag = async (id: number) => {
    // TODO: Implement API call
    console.log('Delete tag:', id)
  }

  return {
    tags: readonly(tags),
    loading: readonly(loading),
    fetchTags,
    createTag,
    updateTag,
    deleteTag
  }
})
