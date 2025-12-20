<spec lang="md">
# レシピ別チェック一覧

> 概要: 特定レシピに紐づくチェック（ログ）を一覧表示するサブページ。

## Data
- `checks` 配列（user, note, createdAt など）

## Interactions
- チェックの詳細確認、フィードバック追加（必要に応じて）

## Features
- フィルタ、ソート、ページネーション

## Error Handling
- データ取得失敗時は画面領域でエラー表示

## i18n
- 文言は翻訳キーで管理

## Notes
- このページはレシピ詳細のタブ/サブルートとして扱われる
</spec>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        {{ t('recipeChecks.title') }}
      </h1>
      <UButton
        variant="ghost"
        @click="navigateTo('/')"
      >
        {{ t('recipeChecks.back') }}
      </UButton>
    </div>

    <div
      v-if="checks.length === 0"
      class="text-center py-8"
    >
      <p class="text-sm text-gray-500">
        {{ t('recipeChecks.noHistory') }}
      </p>
    </div>

    <div
      v-else
      class="space-y-2"
    >
      <div
        v-for="check in checks"
        :key="check.id"
        class="flex items-center justify-between p-3 bg-white rounded shadow-sm"
      >
        <div>
          <div class="text-sm text-gray-700">
            {{ formatDate(check.createdAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useChecksStore } from '~/stores/data/checks'
import { useChecksPageStore } from '~/stores/pages/checks'

definePageMeta({ requiresAuth: true })

const route = useRoute()
const recipeId = Number(route.params.id)

const checksStore = useChecksStore()
const checksPage = useChecksPageStore()

const checks = computed(() => checksStore.checks)

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

onMounted(async () => {
  await checksPage.fetchChecks(recipeId)
})

const { t } = useI18n()
</script>
