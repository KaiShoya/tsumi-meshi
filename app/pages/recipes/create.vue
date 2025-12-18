<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">
      {{ t('recipes.new') }}
    </h1>

    <UCard>
      <UForm @submit="handleSubmit">
        <UFormGroup name="title" class="mb-4">
          <label for="title" class="block text-sm font-medium mb-1">Title</label>
          <UInput id="title" v-model="form.title" />
        </UFormGroup>

        <UFormGroup name="url" class="mb-4">
          <label for="url" class="block text-sm font-medium mb-1">URL</label>
          <UInput id="url" v-model="form.url" />
        </UFormGroup>

        <UFormGroup name="description" class="mb-4">
          <label for="description" class="block text-sm font-medium mb-1">Description</label>
          <UTextarea id="description" v-model="form.description" />
        </UFormGroup>

        <UFormGroup name="image" class="mb-4">
          <label for="image" class="block text-sm font-medium mb-1">Image</label>
          <ImageUploader id="image" @uploaded="handleUploaded" />
          <div
            v-if="imageKey"
            class="text-sm text-gray-600 mt-2"
          >
            {{ imageKey }}
          </div>
        </UFormGroup>

        <div
          class="flex justify-end gap-2 mt-4"
        >
          <UButton type="submit">
            {{ t('common.create') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import ImageUploader from '~/components/ImageUploader.vue'

definePageMeta({ requiresAuth: true })

const { t } = useI18n()
const router = useRouter()

const form = reactive({ title: '', url: '', description: '', folderId: undefined })
let imageKey: string | null = null

function handleUploaded(key: string | null) {
  imageKey = key
}

async function handleSubmit() {
  try {
    const payload: { title: string, url: string, description?: string, folderId?: number, imageUrl?: string | null } = {
      title: String(form.title),
      url: String(form.url),
      description: form.description ? String(form.description) : undefined,
      folderId: form.folderId
    }
    if (imageKey) payload.imageUrl = imageKey

    try {
      // Use centralized apiClient (Cloudflare Workers)
      await (await import('~/utils/api/client')).apiClient.createRecipe(payload)
    } catch (err) {
      console.error(err)
      throw err
    }
    await router.push('/')
  } catch (err: unknown) {
    console.error(err)
  }
}
</script>
