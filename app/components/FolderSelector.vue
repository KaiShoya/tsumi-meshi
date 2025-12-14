<template>
  <div>
    <label class="block text-sm font-medium text-gray-700">フォルダ</label>
    <select
      class="mt-1 block w-full rounded border-gray-300"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value ? Number($event.target.value) : null)"
    >
      <option :value="null">— なし —</option>
      <template v-for="folder in flattened">
        <option :key="folder.id" :value="folder.id">
          {{ ' '.repeat(folder.level * 2) + folder.name }}
        </option>
      </template>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useFoldersStore } from '~/stores/data/folders'
import type { Folder } from '~/repositories/folders'

const props = defineProps<{ modelValue?: number | null }>()
const emit = defineEmits(['update:modelValue'])

const store = useFoldersStore()

onMounted(async () => {
  await store.fetchFolders()
})

const flattened = computed(() => {
  // simple flatten: no hierarchy required for select, just show depth if children present
  const res: { id: number; name: string; level: number }[] = []
  const map = new Map<number, Folder>()
  store.folders.forEach(f => map.set(f.id, f))

  const addWithLevel = (f: Folder, level = 0) => {
    res.push({ id: f.id, name: f.name, level })
    if (f.children && f.children.length > 0) {
      f.children.forEach(c => addWithLevel(c as Folder, level + 1))
    }
  }

  // Build hierarchy from flat list if children not present
  const hasChildrenFlag = store.folders.some(f => f.parentId)
  if (!hasChildrenFlag) {
    store.folders.forEach(f => res.push({ id: f.id, name: f.name, level: 0 }))
    return res
  }

  // Build simple tree
  const roots: Folder[] = []
  const nodes = new Map<number, Folder & { children?: Folder[] }>()
  store.folders.forEach(f => nodes.set(f.id, { ...f, children: [] }))
  nodes.forEach(n => {
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
