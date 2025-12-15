<spec lang="md">
# FolderTree

概要: フォルダの階層をツリー表示するコンポーネント。`FolderNode` を再帰的に描画する。

## Data
- `folders: Folder[]` を props で受け取る

## Interactions
- 編集・削除・移動イベントを親へ伝搬する

## Features
- ツリー構築ロジックを内包

## Notes
- ファイル: app/components/FolderTree.vue
</spec>

<template>
  <ul class="folder-tree">
    <FolderNode
      v-for="node in roots"
      :key="node.id"
      :node="node"
      @edit="onEdit"
      @delete="onDelete"
      @move="onMove"
    />
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FolderNode from './FolderNode.vue'

import type { Folder } from '~/repositories/folders'

const props = defineProps<{ folders: Folder[] }>()
const emit = defineEmits(['edit', 'delete', 'move'])

const onEdit = (p: Folder) => emit('edit', p)
const onDelete = (p: Folder) => emit('delete', p)
const onMove = (p: { id: number, parentId?: number | null }) => emit('move', p)

const buildTree = (folders: Folder[]) => {
  const nodes = new Map<number, Folder & { children?: Folder[] }>()
  const roots: (Folder & { children?: Folder[] })[] = []

  folders.forEach(f => nodes.set(f.id, { ...f, children: [] }))

  nodes.forEach((n) => {
    if (n.parentId && nodes.has(n.parentId)) {
      nodes.get(n.parentId)!.children!.push(n)
    } else {
      roots.push(n)
    }
  })

  return roots
}

const roots = computed(() => buildTree(props.folders || []))
</script>

<style scoped>
.folder-tree { list-style: none; padding: 0; margin: 0 }
.folder-node > div { padding: 0.5rem; border-radius: 4px }
.folder-node > div:hover { background: rgba(0,0,0,0.02) }
.btn-ghost { background: transparent; border: none; cursor: pointer }
</style>
