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
      <h1 class="text-2xl font-bold">
        レシピ一覧
      </h1>
      <UButton
        icon="i-lucide-plus"
        size="lg"
        @click="navigateTo('/recipes/create')"
      >
        新規レシピ
      </UButton>
    </div>

    <!-- Search and Filters -->
    <div class="space-y-4">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="レシピを検索..."
        size="lg"
        @input="handleSearch"
      />

      <div class="flex gap-4">
        <USelectMenu
          v-model="selectedFolder"
          :options="folderOptions"
          placeholder="フォルダを選択"
          @update:model-value="handleFolderFilter"
        />
        <USelectMenu
          v-model="selectedTags"
          :options="tagOptions"
          multiple
          placeholder="タグを選択"
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
                :color="recipe.checks.length > 0 ? 'green' : 'gray'"
                variant="ghost"
                size="sm"
                @click.stop="toggleCheck(recipe)"
              />
              <UDropdown
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
              </UDropdown>
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
        レシピがありません
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        最初のレシピを作成しましょう。
      </p>
      <div class="mt-6">
        <UButton
          icon="i-lucide-plus"
          @click="navigateTo('/recipes/create')"
        >
          新規レシピ
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecipesPageStore } from '~/stores/pages/recipes'
import type { Recipe } from '~/repositories/recipes'

// Data
const recipes = ref<Recipe[]>([])
const searchQuery = ref('')
const selectedFolder = ref<number | null>(null)
const selectedTags = ref<number[]>([])

// TODO: Load from stores
const folderOptions = ref([])
const tagOptions = ref([])

// Store
const recipesStore = useRecipesPageStore()

// Methods
const handleSearch = useDebounceFn(async () => {
  if (searchQuery.value) {
    await recipesStore.searchRecipes(searchQuery.value)
  } else {
    await recipesStore.fetchRecipes()
  }
}, 300)

const handleFolderFilter = async (folderId: number | null) => {
  // TODO: Implement folder filtering
  console.log('Filter by folder:', folderId)
}

const handleTagFilter = async (tagIds: number[]) => {
  // TODO: Implement tag filtering
  console.log('Filter by tags:', tagIds)
}

const toggleCheck = async (recipe: Recipe) => {
  // TODO: Implement check toggle
  console.log('Toggle check for recipe:', recipe.id)
}

const deleteRecipe = async (recipe: Recipe) => {
  // TODO: Show confirmation dialog
  await recipesStore.deleteRecipe(recipe.id, recipe.title)
}

// Lifecycle
onMounted(async () => {
  const { initAuth, isAuthenticated } = useAuth()
  initAuth()

  if (!isAuthenticated.value) {
    await navigateTo('/auth/login')
    return
  }

  await recipesStore.fetchRecipes()
})
</script>
