<template>
  <div
    class="space-y-2"
  >
    <input
      type="file"
      @change="onFile"
    >
    <div
      v-if="status"
      class="text-sm text-gray-600"
    >
      {{ status }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useUpload from '../composables/useUpload'

const emit = defineEmits<{ (e: 'uploaded', key: string | null): void }>()
const status = ref<string | null>(null)
const { requestUpload } = useUpload()

const onFile = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    status.value = 'Uploading...'
    const key = await requestUpload(file)
    status.value = key ? 'Uploaded' : 'Upload endpoint responded without URL'
    // Emit uploaded key (may be null)
    emit('uploaded', key)
  } catch (err: unknown) {
    status.value = (err as Error).message || 'Upload failed'
  }
}
</script>

<style scoped></style>
