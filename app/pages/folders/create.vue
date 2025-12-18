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
