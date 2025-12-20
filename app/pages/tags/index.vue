<spec lang="md">
# タグ一覧

> 概要: 作成済みのタグ一覧を表示・管理する画面。

## Data
- `tags` 配列（name, count, color など）

## Interactions
- タグ編集・削除・検索
- タグクリックで該当レシピをフィルタ

## Features
- 一覧表示、編集・削除アクション、検索機能

## Error Handling
- 操作失敗時は確認ダイアログ・トーストで通知

## i18n
- `tags.*` キーで管理

## Notes
- タグの色はアクセシビリティを考慮すること
</spec>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1
      class="text-2xl font-semibold mb-4"
    >
      {{ t('tags.title') }}
    </h1>

    <div class="mb-6">
      <UForm
        @submit="onCreate"
      >
        <div class="flex gap-2">
          <label
            for="tag-name-input"
            class="sr-only"
          >{{ t('tags.namePlaceholder') }}</label>
          <UInput
            id="tag-name-input"
            v-model="name"
            :placeholder="t('tags.namePlaceholder')"
          />
          <UButton
            type="submit"
          >
            {{ t('tags.add') }}
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
              :aria-label="`${t('tags.edit')} ${tag.name}`"
              @click="startEdit(tag)"
            >
              {{ t('tags.edit') }}
            </UButton>
            <UButton
              size="sm"
              variant="ghost"
              color="error"
              :aria-label="`${t('tags.delete')} ${tag.name}`"
              @click="remove(tag.id, tag.name)"
            >
              {{ t('tags.delete') }}
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
import type { Tag } from '~/types/tags'

definePageMeta({ requiresAuth: true })

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

const { t } = useI18n()

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
