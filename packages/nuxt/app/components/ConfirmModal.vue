<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >
    <div
      class="fixed inset-0 bg-black/50"
      @click="$emit('close')"
    />

    <div
      class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 z-10"
    >
      <h2
        :id="titleId"
        class="text-lg font-semibold"
      >
        {{ title }}
      </h2>

      <p
        class="mt-2 text-sm text-gray-600"
      >
        {{ message }}
      </p>

      <div
        class="mt-4 flex justify-end gap-3"
      >
        <button
          type="button"
          class="px-4 py-2 bg-gray-100 rounded"
          :disabled="loading"
          @click="$emit('close')"
        >
          {{ cancelLabel }}
        </button>

        <button
          type="button"
          class="px-4 py-2 bg-red-600 text-white rounded"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          <span v-if="!loading">{{ confirmLabel }}</span>
          <span v-else>処理中…</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'OK' },
  cancelLabel: { type: String, default: 'Cancel' },
  loading: { type: Boolean, default: false }
})

const titleId = computed(() => `confirm-${Math.random().toString(36).slice(2, 8)}`)

defineEmits(['confirm', 'close'])
</script>
