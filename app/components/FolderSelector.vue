<spec lang="md">
# FolderSelector

概要: フォルダを選択するためのシンプルなセレクトコンポーネント。

## Data
- `useFoldersStore()` からフォルダ一覧を取得

## Interactions
- 親フォルダの選択・解除

## Features
- 階層をインデントして表示するフラットなセレクト

## Notes
- ファイル: app/components/FolderSelector.vue
</spec>

<template>
  <div>
    <label
      for="folder-select"
      class="block text-sm font-medium text-gray-700"
    >フォルダ</label>
    <select
      id="folder-select"
      class="mt-1 block w-full rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option :value="null">
        — なし —
      </option>
      <template
        v-for="folder in flattened"
        :key="folder.id"
      >
        <option :value="folder.id">
          {{ ' '.repeat(folder.level * 2) + folder.name }}
        </option>
      </template>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, unref, type Ref } from 'vue'
import { useFoldersStore } from '~/stores/data/folders'
import type { Folder } from '~/repositories/folders'

type FoldersStoreLike = {
  fetchFolders?: () => Promise<void>
  folders?: Folder[] | Ref<Folder[]>
}

defineProps<{ modelValue?: number | null }>()
defineEmits(['update:modelValue'])

const store = useFoldersStore()

onMounted(async () => {
  const s = store as unknown as FoldersStoreLike
  if (s && typeof s.fetchFolders === 'function') {
    await s.fetchFolders()
  }
})

const flattened = computed(() => {
  // simple flatten: no hierarchy required for select, just show depth if children present
  const res: { id: number, name: string, level: number }[] = []
  const map = new Map<number, Readonly<Folder>>()
  const storeFolders = unref(((store as unknown) as FoldersStoreLike)?.folders) || []
  storeFolders.forEach((f: Folder) => map.set(f.id, f as Readonly<Folder>))

  const addWithLevel = (f: Readonly<Folder>, level = 0) => {
    res.push({ id: f.id, name: f.name, level })
    if (f.children && f.children.length > 0) {
      f.children.forEach(c => addWithLevel(c as Readonly<Folder>, level + 1))
    }
  }

  // Build hierarchy from flat list if children not present
  const hasChildrenFlag = storeFolders.some((f: Folder) => !!(f as Folder).parentId)
  if (!hasChildrenFlag) {
    storeFolders.forEach((f: Folder) => res.push({ id: f.id, name: f.name, level: 0 }))
    return res
  }

  // Build simple tree
  const roots: Folder[] = []
  const nodes = new Map<number, Folder & { children?: Folder[] }>()
  storeFolders.forEach((f: Folder) => nodes.set(f.id, { ...f, children: [] }))
  nodes.forEach((n) => {
    if (n.parentId && nodes.has(n.parentId)) nodes.get(n.parentId)!.children!.push(n)
    else roots.push(n)
  })
  roots.forEach(r => addWithLevel(r, 0))
  return res
})
</script>

<style scoped>
select { padding: 0.45rem 0.5rem }
</style>
