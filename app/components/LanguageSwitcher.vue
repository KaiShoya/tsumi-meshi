<template>
  <div>
    <select v-model="current" @change="onChange" class="rounded border px-2 py-1 text-sm">
      <option value="ja">日本語</option>
      <option value="en">English</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import useI18n from '~/composables/useI18n'

const { locale, setLocale } = useI18n()
const current = ref(locale.value)

watch(locale, (v) => { current.value = v })

const onChange = () => {
  setLocale(current.value)
}
</script>
