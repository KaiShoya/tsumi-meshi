<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-2xl font-semibold mb-4">
      {{ t('tags.add') }}
    </h1>

    <UForm @submit="onCreate">
      <div class="flex gap-2">
        <UInput
          v-model="name"
          :placeholder="t('tags.namePlaceholder')"
        />
        <UButton type="submit">
          {{ t('tags.add') }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTagsPageStore } from '~/stores/pages/tags'
import { useRouter } from '#imports'

definePageMeta({ requiresAuth: true })

const name = ref('')
const pageStore = useTagsPageStore()
const router = useRouter()

const onCreate = async () => {
  if (!name.value) return
  await pageStore.createTag({ name: name.value })
  name.value = ''
  router.push('/tags')
}

const { t } = useI18n()
</script>
