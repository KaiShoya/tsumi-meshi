<template>
  <UModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">
          フォルダ編集
        </h2>
      </template>

      <UForm
        :state="state"
        @submit="handleSubmit"
      >
        <UFormGroup
          label="フォルダ名"
          name="name"
          class="mb-4"
        >
          <UInput
            v-model="state.name"
            placeholder="フォルダ名"
          />
        </UFormGroup>
        <UFormGroup
          label="親フォルダ"
          name="parentId"
        >
          <FolderSelector v-model="state.parentId" />
        </UFormGroup>

        <div class="flex justify-end gap-2 mt-6">
          <UButton
            variant="ghost"
            @click="$emit('update:modelValue', false)"
          >
            キャンセル
          </UButton>
          <UButton
            type="submit"
          >
            保存
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import type { FolderUpdate } from '~/repositories/folders'

const props = defineProps<{
  modelValue: boolean
  folder: { id: number, name: string, parentId?: number | null } | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', payload: { id: number, name: string, parentId?: number | null }): void
}>()

const state = reactive<FolderUpdate & { id?: number }>({ name: '', parentId: undefined })

watch(() => props.folder, (f) => {
  if (f) {
    state.id = f.id
    state.name = f.name
    state.parentId = f.parentId ?? undefined
  }
})

function handleSubmit() {
  if (!state.name || state.id == null) return
  emit('submit', { id: state.id, name: state.name, parentId: state.parentId })
  emit('update:modelValue', false)
}
</script>
