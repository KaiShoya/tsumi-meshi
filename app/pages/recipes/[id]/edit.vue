<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">
      {{ t('recipes.editTitle') || 'Edit recipe' }}
    </h1>

    <UCard v-if="loaded">
      <UForm @submit="handleSubmit">
        <UFormGroup
          label="Title"
          name="title"
          class="mb-4"
        >
          <UInput v-model="form.title" />
        </UFormGroup>

        <UFormGroup
          label="URL"
          name="url"
          class="mb-4"
        >
          <UInput v-model="form.url" />
        </UFormGroup>

        <UFormGroup
          label="Description"
          name="description"
          class="mb-4"
        >
          <UTextarea v-model="form.description" />
        </UFormGroup>

        <UFormGroup
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
        </UFormGroup>

        <div
          class="flex justify-end gap-2 mt-4"
        >
          <UButton type="submit">
            {{ t('common.save') }}
          </UButton>
        </div>
      </UForm>
    </UCard>

    <div v-else class="text-center py-8">
      {{ t('recipes.loading') || 'Loading...' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '~/composables/useI18n'
import ImageUploader from '~/components/ImageUploader.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const id = Number(route.params.id)
const loaded = ref(false)
const imageKey = ref<string | null>(null)
const form = reactive({ title: '', url: '', description: '', folderId: undefined })

onMounted(async () => {
  try {
    const res = await $fetch(`/api/recipes/${id}`)
    // @ts-expect-error - runtime shape from server
    const recipe = res.recipe
    if (recipe) {
      form.title = recipe.title ?? ''
      form.url = recipe.url ?? ''
      form.description = recipe.description ?? ''
      form.folderId = recipe.folder_id ?? undefined
      imageKey.value = recipe.image_url ?? null
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
    await $fetch(`/api/recipes/${id}`, { method: 'PUT', body: payload })
    await router.push('/')
  } catch (err) {
    console.error(err)
  }
}
</script>
