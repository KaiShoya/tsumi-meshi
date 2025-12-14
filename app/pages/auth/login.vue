<spec lang="md">
# ログイン

## Purpose
ユーザーがアカウントにログインするためのページ。

## Data
- `email`: ログイン用のメールアドレス
- `password`: パスワード
- `loading`: 送信中状態
- `error`: エラーメッセージ

## Interactions
- フォーム入力 → `email`/`password` 更新
- ログインボタン → `login` アクション呼び出し
- 成功 → ホームページにリダイレクト
- 失敗 → エラーメッセージ表示

## Features
- メールアドレス/パスワード入力
- ログインボタン
- エラーメッセージ表示
- ローディング状態表示
- レスポンシブデザイン

## Error Handling
- バリデーションエラー → フィールド別エラー表示
- 認証エラー → 汎用エラーメッセージ
- ネットワークエラー → リトライ可能メッセージ

## i18n
- ラベル、ボタン、エラーメッセージはi18n対応

## Notes
- 未ログイン時のみアクセス可能
- ログイン成功時はホームページにリダイレクト
</spec>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          アカウントにログイン
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          または
          <NuxtLink
            to="/auth/register"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            新規登録
          </NuxtLink>
        </p>
      </div>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-6"
        @submit="onSubmit"
      >
        <UFormGroup
          label="メールアドレス"
          name="email"
        >
          <UInput
            v-model="state.email"
            type="email"
            placeholder="your@email.com"
            size="lg"
            required
          />
        </UFormGroup>

        <UFormGroup
          label="パスワード"
          name="password"
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="パスワード"
            size="lg"
            required
          />
        </UFormGroup>

        <div>
          <UButton
            type="submit"
            size="lg"
            class="w-full"
            :loading="loading"
            :disabled="loading"
          >
            ログイン
          </UButton>
        </div>

        <div
          v-if="error"
          class="text-center"
        >
          <p class="text-sm text-red-600">
            {{ error }}
          </p>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useAuth } from '~/composables/useAuth'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false
})

const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const { login } = useAuth()

const onSubmit = async (event: any) => {
  const data = event.data
  loading.value = true
  error.value = ''

  try {
    await login(data.email, data.password)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'ログインに失敗しました'
  } finally {
    loading.value = false
  }
}

// Redirect if already logged in
const { isAuthenticated } = useAuth()
if (isAuthenticated.value) {
  await navigateTo('/')
}
</script>
