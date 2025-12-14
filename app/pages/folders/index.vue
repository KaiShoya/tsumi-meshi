<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-2xl font-semibold mb-4">フォルダ管理</h1>

    <div class="mb-6">
      <UForm @submit="onCreate">
        <div class="flex gap-2">
          <UInput v-model="name" placeholder="フォルダ名" />
          <FolderSelector v-model="parentId" />
          <UButton type="submit">追加</UButton>
        </div>
      </UForm>
    </div>

    <div>
      <ul class="space-y-2">
        <li v-for="folder in folders" :key="folder.id" class="flex items-center justify-between">
          <div>{{ folder.name }}</div>
          <div class="flex gap-2">
            <UButton size="sm" variant="ghost" @click="startEdit(folder)">編集</UButton>
            <UButton size="sm" variant="ghost" color="error" @click="remove(folder.id, folder.name)">削除</UButton>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FolderSelector from '~/components/FolderSelector.vue'
import { useFoldersPageStore } from '~/stores/pages/folders'
import { useFoldersStore } from '~/stores/data/folders'
import type { Folder } from '~/repositories/folders'

const name = ref('')
const parentId = ref<number | null>(null)
const editing = ref<number | null>(null)
const editName = ref('')

const pageStore = useFoldersPageStore()
const dataStore = useFoldersStore()

const folders = dataStore.folders

onMounted(async () => {
  await pageStore.fetchFolders()
})

const onCreate = async () => {
  if (!name.value) return
  await pageStore.createFolder({ name: name.value, parentId: parentId.value ?? undefined })
  name.value = ''
  parentId.value = null
}

const startEdit = (folder: Folder) => {
  editing.value = folder.id
  editName.value = folder.name
}

const remove = async (id: number, title: string) => {
  if (!confirm(`フォルダ「${title}」を削除しますか？`)) return
  await pageStore.deleteFolder(id)
}
</script>

<style scoped></style>
