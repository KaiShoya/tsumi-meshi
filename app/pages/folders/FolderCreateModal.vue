<spec lang="md">
# FolderCreateModal

概要: 新規フォルダ作成用のモーダルフォーム。`submit` イベントで `FolderInput` を送出する。

## Data
- `modelValue: boolean` を受ける

## Interactions
- 作成時に `submit` を emit

## Notes
- ファイル: app/pages/folders/FolderCreateModal.vue
</spec>

<template>
  <UModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">
          新規フォルダ作成
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
          <UButton type="submit">
            作成
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { FolderInput } from '~/repositories/folders'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [payload: FolderInput]
}>()

const state = reactive<FolderInput>({ name: '', parentId: undefined })

function handleSubmit() {
  if (!state.name) return
  emit('submit', { ...state })
  emit('update:modelValue', false)
  // Reset state
  state.name = ''
  state.parentId = undefined
}
</script>
