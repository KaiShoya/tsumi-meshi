<spec lang="md">
# Default Layout

短い説明: アプリ共通のレイアウト。ヘッダー・メイン・フッターを提供する。

## Data
- ユーザー情報: `useAuth()` から取得

## Interactions
- 未認証時に `/auth/login` にリダイレクト

## Features
- グローバルヘッダー、メインコンテンツ、フッター

## Error Handling
- 認証チェック失敗時はリダイレクト

## i18n
- テキストはロケール経由で管理すること

## Notes
- ファイル: app/layouts/default.vue
</spec>

<template>
  <div>
    <!-- Navigation -->
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center space-x-2"
        >
          <UIcon
            name="i-lucide-book-open"
            class="h-6 w-6"
          />
          <span class="font-bold text-lg">積み飯</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{ user?.name }}</span>
          <UButton
            icon="i-lucide-log-out"
            variant="ghost"
            size="sm"
            @click="logout"
          >
            ログアウト
          </UButton>
        </div>
      </template>
    </UHeader>

    <!-- Main Content -->
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </div>
</template>

<script setup lang="ts">
const { user, logout, isAuthenticated } = useAuth()

// Redirect to login if not authenticated
if (!isAuthenticated.value) {
  await navigateTo('/auth/login')
}
</script>
