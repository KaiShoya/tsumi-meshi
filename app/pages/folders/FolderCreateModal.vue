<template>
  <UModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">
          {{ t('folders.create') }}
        </h2>
      </template>

      <UForm
        :state="state"
        @submit="handleSubmit"
      >
        <UFormGroup
          :label="t('folders.namePlaceholder')"
          name="name"
          class="mb-4"
        >
          <UInput
            v-model="state.name"
            :placeholder="t('folders.namePlaceholder')"
          />
        </UFormGroup>
        <UFormGroup
          :label="t('folders.parent')"
          name="parentId"
        >
          <FolderSelector v-model="state.parentId" />
        </UFormGroup>

        <div class="flex justify-end gap-2 mt-6">
          <UButton
            variant="ghost"
            @click="$emit('update:modelValue', false)"
          >
            {{ t('common.cancel') }}
          </UButton>
          <UButton type="submit">
            {{ t('common.create') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { FolderInput } from '~/repositories/folders'
import { useI18n } from '~/composables/useI18n'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [payload: FolderInput]
}>()

const state = reactive<FolderInput>({ name: '', parentId: undefined })

const { t } = useI18n()

function handleSubmit() {
  if (!state.name) return
  emit('submit', { ...state })
  emit('update:modelValue', false)
  // Reset state
  state.name = ''
  state.parentId = undefined
}
</script>
