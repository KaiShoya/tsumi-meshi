<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-2xl font-semibold mb-4">
      {{ t('folders.title') }}
    </h1>

    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div />
        <UButton
          :aria-label="t('folders.create')"
          @click="isCreateModalOpen = true"
        >
          {{ t('folders.create') }}
        </UButton>
      </div>

      <div v-if="loading">
        {{ t('folders.loading') }}
      </div>
      <div v-else-if="rootFolders.length === 0">
        {{ t('folders.noFolders') }}
      </div>

      <div v-else>
        <UForm
          @submit="onCreate"
        >
          <div class="flex gap-2">
            <UInput
              v-model="name"
              :placeholder="t('folders.namePlaceholder')"
            />
            <FolderSelector v-model="parentId" />
            <UButton
              type="submit"
            >
              {{ t('folders.adding') }}
            </UButton>
          </div>
        </UForm>

        <FolderTree
          :folders="folders"
          @edit="handleEdit"
          @delete="handleDelete"
          @move="handleMove"
        />
      </div>

      <FolderCreateModal
        v-model:model-value="isCreateModalOpen"
        @submit="onCreate"
      />
      <FolderEditModal
        v-if="editing !== null"
        :model-value="editing !== null"
        :folder="editingFolder"
        @update:model-value="v => { if (!v) editing = null }"
        @submit="onSubmitEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, unref, type Ref } from 'vue'
import FolderSelector from '~/components/FolderSelector.vue'
import FolderTree from '~/components/FolderTree.vue'
import FolderCreateModal from './FolderCreateModal.vue'
import FolderEditModal from './FolderEditModal.vue'
import { useFoldersPageStore } from '~/stores/pages/folders'
import { useFoldersStore } from '~/stores/data/folders'
import type { Folder } from '~/repositories/folders'

definePageMeta({ requiresAuth: true })

const name = ref('')
const parentId = ref<number | null>(null)
const editing = ref<number | null>(null)
const editName = ref('')
const editingFolder = computed(() => {
  if (editing.value == null) return null
  const list = unref(folders) || []
  return (list as Folder[]).find(f => f.id === editing.value) || null
})

const isCreateModalOpen = ref(false)

const buildTree = (foldersList: Folder[]) => {
  const nodes = new Map<number, Folder & { children?: Folder[] }>()
  const roots: (Folder & { children?: Folder[] })[] = []
  foldersList.forEach((f) => {
    nodes.set(f.id, { ...f, children: [] })
  })
  nodes.forEach((n) => {
    if (n.parentId && nodes.has(n.parentId)) {
      nodes.get(n.parentId)!.children!.push(n)
    } else {
      roots.push(n)
    }
  })
  return roots
}

const rootFolders = computed(() => buildTree((unref(folders) as Folder[]) || []))

type FoldersStoreLike = {
  loading?: boolean | Ref<boolean>
  folders?: Folder[] | Ref<Folder[]>
  fetchFolders?: () => Promise<void>
}

const pageStore = useFoldersPageStore()
const dataStore = useFoldersStore()

const loading = computed(() => {
  const ds = dataStore as unknown as FoldersStoreLike
  const l = ds && typeof ds.loading !== 'undefined' ? unref(ds.loading as Ref<boolean>) : false
  return !!l
})

const folders = (dataStore as unknown as FoldersStoreLike).folders || []

onMounted(async () => {
  await pageStore.fetchFolders()
})

const { t } = useI18n()

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
  if (!confirm(t('folders.deleteConfirm').replace('{title}', title))) return
  await pageStore.deleteFolder(id)
}

const onMove = async ({ id, parentId }: { id: number, parentId?: number | null }) => {
  // update parentId (coerce null -> undefined)
  await pageStore.updateFolder(id, { parentId: parentId ?? undefined })
}

const onSubmitEdit = async (payload: { id: number, name: string, parentId?: number | null }) => {
  await pageStore.updateFolder(payload.id, { name: payload.name, parentId: payload.parentId ?? undefined })
  editing.value = null
}

// Template handlers without inline arrow functions (avoids implicit any in templates)
const handleEdit = (f: Folder) => {
  startEdit(f)
}
const handleDelete = (f: Folder) => {
  remove(f.id, f.name)
}
const handleMove = (p: { id: number, parentId?: number | null }) => {
  onMove(p)
}
</script>

<style scoped></style>
