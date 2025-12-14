<spec lang="md">
# 新規登録

## Purpose
新規ユーザーがアカウントを作成するためのページ。

## Data
- `name`: ユーザー名
- `email`: メールアドレス
- `password`: パスワード
- `confirmPassword`: パスワード確認
- `loading`: 送信中状態
- `error`: エラーメッセージ

## Interactions
- フォーム入力 → 各フィールド更新
- 登録ボタン → `register` アクション呼び出し
- 成功 → ログインにリダイレクト
- 失敗 → エラーメッセージ表示

## Features
- 名前/メールアドレス/パスワード入力
- パスワード確認フィールド
- 登録ボタン
- エラーメッセージ表示
- ローディング状態表示
- レスポンシブデザイン

## Error Handling
- バリデーションエラー → フィールド別エラー表示
- 重複メールアドレス → 具体的なエラーメッセージ
- ネットワークエラー → リトライ可能メッセージ

## i18n
- ラベル、ボタン、エラーメッセージはi18n対応

## Notes
- 未ログイン時のみアクセス可能
- 登録成功時はログインページにリダイレクト
</spec>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          アカウントを作成
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          または
          <NuxtLink
            to="/auth/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            ログイン
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
          label="名前"
          name="name"
        >
          <UInput
            v-model="state.name"
            placeholder="あなたの名前"
            size="lg"
            required
          />
        </UFormGroup>

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

        <UFormGroup
          label="パスワード（確認）"
          name="confirmPassword"
        >
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="パスワードを再入力"
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
            アカウント作成
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
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const { register } = useAuth()

const onSubmit = async (event: any) => {
  const data = event.data
  loading.value = true
  error.value = ''

  try {
    await register(data.name, data.email, data.password)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '登録に失敗しました'
  } finally {
    loading.value = false
  }
}
</script>
