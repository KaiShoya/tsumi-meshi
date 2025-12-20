<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">
      {{ t('recipes.new') }}
    </h1>

    <UCard>
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

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Magic Import</h3>
          <div class="flex gap-2 items-center">
            <input v-model="importUrl" placeholder="https://..." class="flex-1 rounded border px-3 py-2" />
            <UButton type="button" @click="handleAutoParse">Auto-Parse</UButton>
          </div>
          <p class="text-sm text-gray-500 mt-2">Paste a URL and click Auto-Parse to prefill ingredients and steps (stub).</p>
        </div>

        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Ingredients</h3>
          <div class="flex flex-col gap-2">
            <div v-for="(ing, i) in ingredients" :key="i" class="flex gap-2">
              <input v-model="ingredients[i]" class="flex-1 rounded border px-3 py-2" />
              <button type="button" class="text-red-500" @click="removeIngredient(i)">Remove</button>
            </div>
            <button type="button" class="text-sm text-primary mt-2" @click="addIngredient">+ Add Ingredient</button>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Instructions</h3>
          <div class="flex flex-col gap-3">
            <div v-for="(step, idx) in instructions" :key="idx" class="border rounded p-3">
              <div class="flex justify-between items-start gap-2">
                <div class="font-bold">Step {{ idx + 1 }}</div>
                <button type="button" class="text-red-500" @click="removeStep(idx)">Remove</button>
              </div>
              <textarea v-model="instructions[idx].text" class="w-full mt-2 rounded border px-3 py-2" rows="3" />
            </div>
            <button type="button" class="text-sm text-primary mt-2" @click="addStep">+ Add Step</button>
          </div>
        </div>

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
            {{ t('common.create') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ImageUploader from '~/components/ImageUploader.vue'
import { apiClient } from '~/utils/api/client'
import { useLogger } from '~/composables/useLogger'
import { useAppToast } from '~/composables/useAppToast'

definePageMeta({ requiresAuth: true })

const { t } = useI18n()
const router = useRouter()

const form = reactive({ title: '', url: '', description: '', folderId: undefined })
const imageKey = ref<string | null>(null)

// Magic import / ingredients / instructions (local stub)
const importUrl = ref('')
const ingredients = ref<string[]>([])
const instructions = ref<Array<{ text: string }>>([])

function handleUploaded(key: string | null) {
  imageKey.value = key
}

function addIngredient() { ingredients.value.push('') }
function removeIngredient(i: number) { ingredients.value.splice(i, 1) }

function addStep() { instructions.value.push({ text: '' }) }
function removeStep(i: number) { instructions.value.splice(i, 1) }

async function handleAutoParse() {
  // Stub: pretend we parsed the URL and fill sample data
  if (!importUrl.value) {
    const { showInfoToast } = useAppToast()
    showInfoToast('URL を入力してください')
    return
  }
  // Prefill some realistic sample data to match image expectations
  ingredients.value = ['1 block extra firm tofu', '2 tbsp cornstarch', '1 tbsp sesame oil', '2 cloves garlic']
  instructions.value = [
    { text: 'Press tofu to remove excess water.' },
    { text: 'Cut into cubes, coat with cornstarch.' },
    { text: 'Fry until golden and toss with sauce.' }
  ]
  const { showSuccessToast } = useAppToast()
  showSuccessToast('自動解析（スタブ）で材料と手順を入力しました')
}

async function handleSubmit() {
  try {
    const payload: { title: string, url: string, description?: string, folderId?: number, imageUrl?: string | null, ingredients?: string[], instructions?: Array<{ text: string }> } = {
      title: String(form.title),
      url: String(form.url),
      description: form.description ? String(form.description) : undefined,
      folderId: form.folderId
    }
    if (imageKey.value) payload.imageUrl = imageKey.value
    if (ingredients.value.length > 0) payload.ingredients = ingredients.value
    if (instructions.value.length > 0) payload.instructions = instructions.value

    try {
      // Use centralized apiClient (Cloudflare Workers)
      await apiClient.createRecipe(payload)
    } catch (err) {
      const logger = useLogger()
      const { showDangerToast } = useAppToast()
      logger.error('Failed to create recipe', { module: 'recipes.create' }, err instanceof Error ? err : undefined)
      showDangerToast('レシピの作成に失敗しました')
      throw err
    }
    await router.push('/')
  } catch (err: unknown) {
    const logger = useLogger()
    const { showDangerToast } = useAppToast()
    logger.error('Unhandled error in create recipe', { module: 'recipes.create' }, err instanceof Error ? err : undefined)
    showDangerToast('エラーが発生しました')
  }
}
</script>
