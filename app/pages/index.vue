<spec lang="md">
# ホーム（レシピ一覧）

## Purpose
ユーザーが保存したレシピの一覧を表示し、検索・フィルタ・作成・編集・削除などの基本操作を提供するメイン画面。

## Data
- `recipes`: レシピ一覧（store/data/recipesから取得）
- `searchQuery`: 検索クエリ
- `selectedFolder`: 選択中のフォルダ
- `selectedTags`: 選択中のタグ

## Interactions
- 検索バー入力 → `searchRecipes` アクション呼び出し
- フォルダ選択 → `filterByFolder` アクション呼び出し
- タグ選択 → `filterByTags` アクション呼び出し
- レシピ作成ボタン → `/recipes/create` に遷移
- レシピクリック → `/recipes/[id]` に遷移
- レシピ削除 → 確認ダイアログ → `deleteRecipe` アクション呼び出し

## Features
- レシピ一覧表示（カード形式）
- 検索・フィルタ機能
- ページネーション（将来的に）
- レスポンシブデザイン

## Error Handling
- データ読み込み失敗 → エラーメッセージ表示
- 検索失敗 → エラートースト表示
- 削除失敗 → エラートースト表示

## i18n
- テキストは `locales/ja.ts` から取得
- ボタンラベル、メッセージなどすべてi18n対応

## Notes
- 認証必須ページ（未ログイン時はリダイレクト）
- モバイル対応：カードを縦並びに
</spec>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold">
          {{ t('recipes.listTitle') }}
        </h1>
        <UButton
          variant="outline"
          size="sm"
          @click="navigateTo('/checks')"
        >
          {{ t('checks.title') }}
        </UButton>
      </div>

      <UButton
        icon="i-lucide-plus"
        size="lg"
        @click="navigateTo('/recipes/create')"
      >
        {{ t('recipes.new') }}
      </UButton>
    </div>

    <!-- Search and Filters -->
    <div class="space-y-4">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        :placeholder="t('recipes.searchPlaceholder')"
        size="lg"
        @input="handleSearch"
      />

      <div class="flex gap-4">
        <USelectMenu
          v-model="selectedFolder"
          :options="folderOptions"
          :placeholder="t('recipes.folderPlaceholder')"
          @update:model-value="handleFolderFilter"
        />
        <USelectMenu
          v-model="selectedTags"
          :options="tagOptions"
          multiple
          :placeholder="t('recipes.tagsPlaceholder')"
          @update:model-value="handleTagFilter"
        />
      </div>
    </div>

    <!-- Recipe Grid -->
    <div
      v-if="recipes.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <UCard
        v-for="recipe in recipes"
        :key="recipe.id"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        @click="navigateTo(`/recipes/${recipe.id}`)"
      >
        <div class="space-y-3">
          <div
            v-if="recipe.imageUrl"
            class="aspect-video rounded-lg overflow-hidden"
          >
            <img
              :src="recipe.imageUrl"
              :alt="recipe.title"
              class="w-full h-full object-cover"
            >
          </div>

          <div>
            <h3 class="font-semibold text-lg line-clamp-2">
              {{ recipe.title }}
            </h3>
            <p
              v-if="recipe.description"
              class="text-sm text-gray-600 line-clamp-2 mt-1"
            >
              {{ recipe.description }}
            </p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex gap-1">
              <UBadge
                v-for="tag in recipe.tags.slice(0, 3)"
                :key="tag.id"
                variant="subtle"
                size="sm"
              >
                {{ tag.name }}
              </UBadge>
              <UBadge
                v-if="recipe.tags.length > 3"
                variant="subtle"
                size="sm"
              >
                +{{ recipe.tags.length - 3 }}
              </UBadge>
            </div>

            <div class="flex gap-2">
              <UButton
                icon="i-lucide-check-circle"
                :color="recipe.checks.length > 0 ? 'success' : 'neutral'"
                variant="ghost"
                size="sm"
                @click.stop="toggleCheck(recipe)"
              />
              <UButton
                icon="i-lucide-clock"
                variant="ghost"
                size="sm"
                @click.stop="navigateTo(`/recipes/${recipe.id}/checks`)"
              />
              <UDropdownMenu
                :items="[{
                  label: '編集',
                  icon: 'i-lucide-edit',
                  click: () => navigateTo(`/recipes/${recipe.id}/edit`)
                }, {
                  label: '削除',
                  icon: 'i-lucide-trash',
                  click: () => deleteRecipe(recipe)
                }]"
              >
                <UButton
                  icon="i-lucide-more-vertical"
                  variant="ghost"
                  size="sm"
                  @click.stop
                />
              </UDropdownMenu>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-lucide-book-open"
        class="mx-auto h-12 w-12 text-gray-400"
      />
      <h3 class="mt-2 text-sm font-semibold text-gray-900">
        {{ t('recipes.noRecipesTitle') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ t('recipes.noRecipesBody') }}
      </p>
      <div class="mt-6">
        <UButton
          icon="i-lucide-plus"
          @click="navigateTo('/recipes/create')"
        >
          {{ t('recipes.new') }}
        </UButton>
      </div>
    </div>
    <ConfirmModal
      v-if="showConfirmModal"
      :title="t('confirm.deleteTitle')"
      :message="t('confirm.deleteMessage').replace('{title}', confirmTargetTitle)"
      :confirm-label="t('confirm.deleteLabel')"
      :cancel-label="t('common.cancel')"
      :loading="deleting"
      @confirm="performDelete"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useRecipesPageStore } from '~/stores/pages/recipes'
import type { Recipe } from '~/repositories/recipes'
import type { SelectMenuItem } from '@nuxt/ui'
import { useDebounceFn } from '@vueuse/core'
import { apiClient } from '~/utils/api/client'
import { useRecipesStore } from '~/stores/data/recipes'
import { useAppToast } from '~/composables/useAppToast'
import { useLogger } from '~/composables/useLogger'
import { useAuth } from '~/composables/useAuth'
import { ref, computed, onMounted } from 'vue'
import ConfirmModal from '~/components/ConfirmModal.vue'

definePageMeta({ requiresAuth: true })

// Data
const searchQuery = ref('')
const selectedFolder = ref<number | null>(null)
const selectedTags = ref<number[]>([])

const folderOptions = ref<Array<{ label: string, value: number }>>([])
const tagOptions = ref<Array<{ label: string, value: number }>>([])

// Store
const recipesStore = useRecipesPageStore()
const recipesStoreData = useRecipesStore()
const { showDangerToast } = useAppToast()
const recipes = computed(() => recipesStoreData.recipes)

// Confirmation modal state
const showConfirmModal = ref(false)
const confirmTargetId = ref<number | null>(null)
const confirmTargetTitle = ref('')
const deleting = ref(false)

// Methods
const { t } = useI18n()
const handleSearch = useDebounceFn(async () => {
  if (searchQuery.value) {
    await recipesStore.searchRecipes(searchQuery.value)
  } else {
    await recipesStore.fetchRecipes({ folderId: selectedFolder.value ?? undefined, tagIds: selectedTags.value })
  }
}, 300)

const handleFolderFilter = async (value: SelectMenuItem) => {
  const folderId = typeof value === 'number' ? value : null
  selectedFolder.value = folderId
  await recipesStore.fetchRecipes({ folderId: folderId ?? undefined })
}

const handleTagFilter = async (value: SelectMenuItem[]) => {
  const tagIds = value.filter((item): item is number => typeof item === 'number')
  selectedTags.value = tagIds
  await recipesStore.fetchRecipes({ tagIds })
}

const toggleCheck = async (recipe: Recipe) => {
  try {
    await recipesStore.toggleCheck(recipe.id)
  } catch (err: unknown) {
    const logger = useLogger()
    logger.error('Failed to toggle check', { module: 'indexPage', recipeId: recipe.id }, err instanceof Error ? err : new Error(String(err)))
    showDangerToast('チェックの登録に失敗しました')
  }
}

const deleteRecipe = async (recipe: Recipe) => {
  // open confirmation dialog
  confirmTargetId.value = recipe.id
  confirmTargetTitle.value = recipe.title
  showConfirmModal.value = true
}

const performDelete = async () => {
  if (confirmTargetId.value == null) return
  deleting.value = true
  try {
    await recipesStore.deleteRecipe(confirmTargetId.value, confirmTargetTitle.value)
    showConfirmModal.value = false
  } catch (err: unknown) {
    const logger = useLogger()
    logger.error('Failed to delete recipe', { module: 'indexPage', recipeId: confirmTargetId.value }, err instanceof Error ? err : new Error(String(err)))
    showDangerToast('レシピの削除に失敗しました')
  } finally {
    deleting.value = false
    confirmTargetId.value = null
    confirmTargetTitle.value = ''
  }
}

// Lifecycle
onMounted(async () => {
  const { initAuth, isAuthenticated } = useAuth()
  await initAuth()

  if (!isAuthenticated.value) {
    // middleware will perform navigation; stop further page init
    return
  }

  // Load initial data
  await recipesStore.fetchRecipes()
  try {
    const tagsRes = await apiClient.getTags()
    tagOptions.value = ((tagsRes.tags ?? []) as Array<{ id: number, name: string }>).map(t => ({ label: t.name, value: t.id }))
  } catch (err: unknown) {
    const logger = useLogger()
    logger.error('Failed to load tags', { module: 'indexPage' }, err instanceof Error ? err : new Error(String(err)))
    showDangerToast('タグの読み込みに失敗しました')
  }

  try {
    const foldersRes = await apiClient.getFolders()
    folderOptions.value = ((foldersRes.folders ?? []) as Array<{ id: number, name: string }>).map(f => ({ label: f.name, value: f.id }))
  } catch (err: unknown) {
    const logger = useLogger()
    logger.error('Failed to load folders', { module: 'indexPage' }, err instanceof Error ? err : new Error(String(err)))
    showDangerToast('フォルダの読み込みに失敗しました')
  }
})
</script>
