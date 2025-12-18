<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">
      {{ t('recipes.editTitle') || 'Edit recipe' }}
    </h1>

    <UCard v-if="loaded">
      <UForm @submit="handleSubmit">
        <UFormField
          label="Title"
          name="title"
          class="mb-4"
        >
          <UInput v-model="form.title" />
        </UFormField>

        <UFormField
          label="URL"
          name="url"
          class="mb-4"
        >
          <UInput v-model="form.url" />
        </UFormField>

        <UFormField
          label="Description"
          name="description"
          class="mb-4"
        >
          <UTextarea v-model="form.description" />
        </UFormField>

        <UFormField
          label="Image"
          name="image"
          class="mb-4"
        >
          <ImageUploader @uploaded="handleUploaded" />
          <div
            v-if="imageKey"
            class="text-sm text-gray-600 mt-2"
          >
            {{ imageKey }}
          </div>
        </UFormField>

        <div
          class="flex justify-end gap-2 mt-4"
        >
          <UButton type="submit">
            {{ t('common.save') }}
          </UButton>
        </div>
      </UForm>
    </UCard>

    <div
      v-else
      class="text-center py-8"
    >
      {{ t('recipes.loading') || 'Loading...' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImageUploader from '~/components/ImageUploader.vue'
import { apiClient } from '~/utils/api/client'

definePageMeta({ requiresAuth: true })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const id = Number(route.params.id)
const loaded = ref(false)
const imageKey = ref<string | null>(null)
type FormType = { title: string, url: string, description: string, folderId?: number | undefined }
const form = reactive<FormType>({ title: '', url: '', description: '', folderId: undefined })

onMounted(async () => {
  try {
    const res = await apiClient.getRecipe(id) as { recipe?: Record<string, unknown> | null }
    const recipe = res.recipe
    if (recipe) {
      const r = recipe as Record<string, unknown>
      form.title = typeof r.title === 'string' ? r.title : ''
      form.url = typeof r.url === 'string' ? r.url : ''
      form.description = typeof r.description === 'string' ? r.description : ''
      form.folderId = typeof r.folderId === 'number'
        ? (r.folderId as number)
        : (typeof r.folder_id === 'number' ? (r.folder_id as number) : undefined)
      imageKey.value = typeof r.imageUrl === 'string'
        ? (r.imageUrl as string)
        : (typeof r.image_url === 'string' ? (r.image_url as string) : null)
    }
  } catch (err) {
    console.error(err)
  } finally {
    loaded.value = true
  }
})

function handleUploaded(key: string | null) {
  imageKey.value = key
}

async function handleSubmit() {
  try {
    const payload = {
      title: String(form.title),
      url: String(form.url),
      description: form.description ? String(form.description) : undefined,
      folderId: form.folderId,
      imageUrl: imageKey.value
    }
    await apiClient.updateRecipe(id, payload)
    await router.push('/')
  } catch (err) {
    console.error(err)
  }
}
</script>
