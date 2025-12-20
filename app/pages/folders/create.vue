<spec lang="md">
# フォルダ作成

> 概要: レシピを整理するフォルダを作成する画面／モーダル。

## Data
- `name`, `description`, 親フォルダの選択（オプション）

## Interactions
- 保存でフォルダ作成APIを呼び出し、成功時に一覧を更新して閉じる

## Features
- バリデーション（必須: name）、親フォルダの選択

## Error Handling
- 作成失敗時はフォームにエラーを表示

## i18n
- `folders.create.*` キーで管理

## Notes
- コンポーネントとしてモーダル内で再利用される
</spec>

<template>
  <div>
    <FolderCreateModal
      :model-value="true"
      @update:model-value="(v) => { if (!v) navigateTo('/folders') }"
      @submit="handleCreate"
    />
  </div>
</template>

<script setup lang="ts">
import FolderCreateModal from '~/pages/folders/FolderCreateModal.vue'
import { useFoldersStore } from '~/stores/data/folders'
import { useAppToast } from '~/composables/useAppToast'
import { useLogger } from '~/composables/useLogger'

const foldersStore = useFoldersStore()
const { showSuccessToast, showDangerToast } = useAppToast()

async function handleCreate(payload: { name: string, parentId?: number }) {
  try {
    await foldersStore.createFolder(payload)
    showSuccessToast('フォルダを作成しました')
    navigateTo('/folders')
  } catch (err: unknown) {
    const logger = useLogger()
    logger.error('Failed to create folder', { module: 'folders/create' }, err instanceof Error ? err : new Error(String(err)))
    showDangerToast('フォルダの作成に失敗しました')
  }
}
</script>
