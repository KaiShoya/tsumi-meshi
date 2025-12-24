<spec lang="md">
# タグ作成

> 概要: 新しいタグを作成する画面/モーダル。レシピの分類に使用する。

## Data
- `name`, `color` などのタグ属性

## Interactions
- 作成ボタンでタグ作成APIを呼び出し、成功時に一覧更新

## Features
- 色指定・説明の入力オプション

## Error Handling
- 重複やバリデーションエラーは明確に表示

## i18n
- `tags.*` キーで管理

## Notes
- 作成後にタグ選択UIへ反映されること
</spec>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-2xl font-semibold mb-4">
      {{ t('tags.add') }}
    </h1>

    <UForm @submit="onCreate">
      <div class="flex gap-2">
        <UInput
          v-model="name"
          :placeholder="t('tags.namePlaceholder')"
        />
        <UButton type="submit">
          {{ t('tags.add') }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTagsPageStore } from '~/stores/pages/tags'
import { useRouter } from '#imports'

definePageMeta({ requiresAuth: true })

const name = ref('')
const pageStore = useTagsPageStore()
const router = useRouter()

const onCreate = async () => {
  if (!name.value) return
  await pageStore.createTag({ name: name.value })
  name.value = ''
  router.push('/tags')
}

const { t } = useI18n()
</script>
