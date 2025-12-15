<spec lang="md">
# FolderNode

概要: 単一ノードを表す再帰コンポーネント。ドラッグ&ドロップと編集・削除ボタンを提供。

## Data
- `node: Folder & { children?: Folder[] }` を props で受け取る

## Interactions
- ドラッグ開始/ドロップで移動イベントを発行
- 編集・削除イベントを発行

## Notes
- ファイル: app/components/FolderNode.vue
</spec>

<template>
  <li class="folder-node">
    <div
      class="flex items-center gap-2"
      draggable="true"
      @dragstart="onDragStart"
    >
      <span class="flex-1">{{ node.name }}</span>
      <button
        class="btn-ghost"
        @click.prevent="onEdit"
      >
        編集
      </button>
      <button
        class="btn-ghost text-red-600"
        @click.prevent="onDelete"
      >
        削除
      </button>
    </div>

    <ul
      v-if="node.children && node.children.length"
      class="ml-4 mt-2 space-y-2"
      @dragover.prevent="onDragOver"
      @drop="onDrop"
    >
      <FolderNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @edit="forwardEdit"
        @delete="forwardDelete"
        @move="forwardMove"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { Folder } from '~/repositories/folders'

const props = defineProps<{ node: Folder & { children?: Folder[] } }>()
const emit = defineEmits(['edit', 'delete', 'move'])

const onDragStart = (ev: DragEvent) => {
  ev.dataTransfer?.setData('text/plain', String(props.node.id))
  if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move'
}

const onDragOver = (ev: DragEvent) => {
  ev.preventDefault()
  if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move'
}

const onDrop = (ev: DragEvent) => {
  ev.preventDefault()
  const id = Number(ev.dataTransfer?.getData('text/plain'))
  if (!isNaN(id) && id !== props.node.id) {
    emit('move', { id, parentId: props.node.id })
  }
}

const onEdit = () => emit('edit', props.node)
const onDelete = () => emit('delete', props.node)
const forwardEdit = (p: Folder) => emit('edit', p)
const forwardDelete = (p: Folder) => emit('delete', p)
const forwardMove = (p: { id: number, parentId?: number | null }) => emit('move', p)
</script>

<style scoped>
.folder-node > div { padding: 0.5rem }
.btn-ghost { background: transparent; border: none; cursor: pointer }
</style>
