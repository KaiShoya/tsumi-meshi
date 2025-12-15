<spec lang="md">
# Tags Page

概要: タグ管理ページ。タグの作成・編集・削除を提供する。

## Data
- `useTagsStore()` と `useTagsPageStore()` を利用

## Interactions
- タグ作成・編集・削除

## Notes
- ファイル: app/pages/tags/index.vue
</spec>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1
      class="text-2xl font-semibold mb-4"
    >
      タグ管理
    </h1>

    <div class="mb-6">
      <UForm
        @submit="onCreate"
      >
        <div class="flex gap-2">
          <label
            for="tag-name-input"
            class="sr-only"
          >タグ名</label>
          <UInput
            id="tag-name-input"
            v-model="name"
            placeholder="タグ名"
          />
          <UButton
            type="submit"
          >
            追加
          </UButton>
        </div>
      </UForm>
    </div>

    <div>
      <ul class="space-y-2">
        <li
          v-for="tag in tags"
          :key="tag.id"
          class="flex items-center justify-between"
        >
          <div class="flex-1 min-w-0">
            <div class="truncate">
              {{ tag.name }}
            </div>
          </div>
          <div class="flex gap-2">
            <UButton
              size="sm"
              variant="ghost"
              :aria-label="`編集 ${tag.name}`"
              @click="startEdit(tag)"
            >
              編集
            </UButton>
            <UButton
              size="sm"
              variant="ghost"
              color="error"
              :aria-label="`削除 ${tag.name}`"
              @click="remove(tag.id, tag.name)"
            >
              削除
            </UButton>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTagsPageStore } from '~/stores/pages/tags'
import { useTagsStore } from '~/stores/data/tags'
import type { Tag } from '~/repositories/tags'

const name = ref('')
const editing = ref<number | null>(null)
const editName = ref('')

const pageStore = useTagsPageStore()
const dataStore = useTagsStore()

const tags = dataStore.tags

onMounted(async () => {
  await pageStore.fetchTags()
})

const onCreate = async () => {
  if (!name.value) return
  await pageStore.createTag({ name: name.value })
  name.value = ''
}

const startEdit = (tag: Tag) => {
  editing.value = tag.id
  editName.value = tag.name
}

const remove = async (id: number, title: string) => {
  if (!confirm(`タグ「${title}」を削除しますか？`)) return
  await pageStore.deleteTag(id)
}
</script>

<style scoped></style>
