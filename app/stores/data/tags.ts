import { defineStore } from 'pinia'
import type { Tag, TagInput } from '~/repositories/tags'
import { apiClient } from '~/utils/api/client'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const loading = ref(false)

  const fetchTags = async () => {
    loading.value = true
    try {
      const res = await apiClient.getTags()
      tags.value = (res.tags ?? []) as Tag[]
    } finally {
      loading.value = false
    }
  }

  const createTag = async (tag: TagInput) => {
    const res = await apiClient.createTag(tag.name)
    const newTag = res.tag as Tag
    tags.value.push(newTag)
    return newTag
  }

  const updateTag = async (id: number, name: string) => {
    const res = await apiClient.updateTag(id, name)
    const updated = res.tag as Tag
    tags.value = tags.value.map(t => (t.id === id ? updated : t))
    return updated
  }

  const deleteTag = async (id: number) => {
    await apiClient.deleteTag(id)
    tags.value = tags.value.filter(t => t.id !== id)
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
