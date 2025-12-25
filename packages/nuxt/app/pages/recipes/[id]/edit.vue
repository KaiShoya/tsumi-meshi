<spec lang="md">
# レシピ編集

> 概要: 既存レシピの編集画面。画像差し替え、材料・手順の編集、タグの変更を行う。

## Data
- `recipe` のフィールドを編集可能なフォームにバインド（title, description, imageKey, ingredients[], instructions[], tags[]）

## Interactions
- 読み込み後にフォームを編集・送信して更新APIを呼び出す
- 画像差し替えは ImageUploader を使う

## Features
- 既存データのプリロード、追加/削除/並び替えサポート

## Error Handling
- 保存失敗はトーストで通知し、フォームをロックしない

## i18n
- ラベル、エラーメッセージは翻訳キー化

## Notes
- 互換のため `image_url` スキーマを扱うコードが残っている可能性あり
</spec>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">
      {{ t('recipes.editTitle') || 'Edit recipe' }}
    </h1>

    <UCard v-if="loaded">
      <UForm @submit="handleSubmit">
        <UFormField
          label="Title"
          name="title"
          class="mb-4"
        >
          <UInput v-model="form.title" />
        </UFormField>

        <UFormField
          label="URL"
          name="url"
          class="mb-4"
        >
          <UInput v-model="form.url" />
        </UFormField>

        <UFormField
          label="Description"
          name="description"
          class="mb-4"
        >
          <UTextarea v-model="form.description" />
        </UFormField>

        <UFormField
          label="Image"
          name="image"
          class="mb-4"
        >
          <ImageUploader @uploaded="handleUploaded" />
          <div
            v-if="imageKey"
            class="text-sm text-gray-600 mt-2"
          >
            {{ imageKey }}
          </div>
        </UFormField>

        <div
          class="flex justify-end gap-2 mt-4"
        >
          <UButton type="submit">
            {{ t('common.save') }}
          </UButton>
        </div>
      </UForm>
    </UCard>

    <div
      v-else
      class="text-center py-8"
    >
      {{ t('recipes.loading') || 'Loading...' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImageUploader from '~/components/ImageUploader.vue'
import { apiClient } from '~/utils/api/client'
import { useLogger } from '~/composables/useLogger'
import { useAppToast } from '~/composables/useAppToast'

definePageMeta({ requiresAuth: true })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const id = Number(route.params.id)
const loaded = ref(false)
const imageKey = ref<string | null>(null)
type FormType = { title: string, url: string, description: string, folderId?: number | undefined }
const form = reactive<FormType>({ title: '', url: '', description: '', folderId: undefined })

onMounted(async () => {
  try {
    const res = await apiClient.getRecipe(id) as { recipe?: Record<string, unknown> | null }
    const recipe = res.recipe
    if (recipe) {
      const r = recipe as Record<string, unknown>
      form.title = typeof r.title === 'string' ? r.title : ''
      form.url = typeof r.url === 'string' ? r.url : ''
      form.description = typeof r.description === 'string' ? r.description : ''
      form.folderId = typeof r.folderId === 'number'
        ? (r.folderId as number)
        : (typeof r.folder_id === 'number' ? (r.folder_id as number) : undefined)
      imageKey.value = typeof r.imageUrl === 'string'
        ? (r.imageUrl as string)
        : (typeof r.image_url === 'string' ? (r.image_url as string) : null)
    }
  } catch (err) {
    const logger = useLogger()
    const { showDangerToast } = useAppToast()
    logger.error('Failed to load recipe for edit', { module: 'recipes.edit', id }, err instanceof Error ? err : undefined)
    showDangerToast('レシピの読み込みに失敗しました')
  } finally {
    loaded.value = true
  }
})

const handleUploaded = (key: string | null) => {
  imageKey.value = key
}

const handleSubmit = async () => {
  try {
    const payload = {
      title: String(form.title),
      url: String(form.url),
      description: form.description ? String(form.description) : undefined,
      folderId: form.folderId,
      imageUrl: imageKey.value
    }
    await apiClient.updateRecipe(id, payload)
    await router.push('/')
  } catch (err) {
    const logger = useLogger()
    const { showDangerToast } = useAppToast()
    logger.error('Failed to update recipe', { module: 'recipes.edit', id }, err instanceof Error ? err : undefined)
    showDangerToast('レシピの更新に失敗しました')
  }
}
</script>
