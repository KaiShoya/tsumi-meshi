<template>
  <div class="p-4 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">
        {{ recipe?.title || t('recipes.loading') }}
      </h1>
      <div class="flex gap-2">
        <UButton
          size="sm"
          @click="navigateTo(`/recipes/${id}/edit`)"
        >
          {{ t('recipes.edit') || 'Edit' }}
        </UButton>
        <UButton
          size="sm"
          variant="ghost"
          @click="navigateTo('/')"
        >
          {{ t('common.cancel') }}
        </UButton>
      </div>
    </div>

    <div
      v-if="loaded"
      class="space-y-6"
    >
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div v-if="recipe?.imageUrl" class="rounded overflow-hidden">
            <img :src="recipe.imageUrl" :alt="recipe.title" class="w-full object-contain" />
          </div>

          <div>
            <p class="text-sm text-gray-600">{{ recipe?.description }}</p>
            <a v-if="recipe?.url" :href="recipe.url" target="_blank" rel="noopener" class="text-blue-600 underline">Open source</a>
          </div>

          <div>
            <h3 class="font-semibold">Ingredients</h3>
            <ul class="list-disc pl-5 mt-2">
              <li v-for="(ing, i) in recipe?.ingredients ?? []" :key="i">{{ ing }}</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mt-4">Instructions</h3>
            <ol class="list-decimal pl-5 mt-2 space-y-2">
              <li v-for="(s, i) in recipe?.instructions ?? []" :key="i">{{ s.text ?? s }}</li>
            </ol>
          </div>
        </div>

        <aside class="space-y-4">
          <div class="bg-white dark:bg-surface-dark p-4 rounded shadow-sm border">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold">Details</h4>
              <div class="text-sm text-gray-500">{ { /* placeholder */ } }</div>
            </div>
            <div class="text-sm text-gray-600">
              <div v-if="recipe?.folderId">Folder: {{ recipe.folderId }}</div>
              <div v-if="recipe?.createdAt">Added: {{ recipe.createdAt }}</div>
            </div>
            <div class="mt-3 flex gap-2">
              <UButton size="sm" @click="navigateTo(`/recipes/${id}/edit`)">Edit</UButton>
              <UButton size="sm" variant="ghost" @click="navigateTo('/')">Back</UButton>
            </div>
          </div>

          <div class="bg-white dark:bg-surface-dark p-4 rounded shadow-sm border">
            <h4 class="font-semibold mb-2">Tags</h4>
            <div class="flex gap-2 flex-wrap">
              <UBadge v-for="tag in recipe?.tags ?? []" :key="tag.id">{{ tag.name }}</UBadge>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8"
    >
      {{ t('recipes.loading') || 'Loading...' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Recipe } from '~/types/recipes'
import { apiClient } from '~/utils/api/client'
import { useLogger } from '~/composables/useLogger'
import { useAppToast } from '~/composables/useAppToast'

definePageMeta({ requiresAuth: true })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const loaded = ref(false)
const recipe = ref<Recipe | null>(null)

onMounted(async () => {
  try {
    const res = await apiClient.getRecipe(id) as { recipe?: Recipe | null }
    recipe.value = res.recipe ?? null
  } catch (err) {
    const logger = useLogger()
    const { showDangerToast } = useAppToast()
    logger.error('Failed to load recipe', { module: 'recipes.view', id }, err instanceof Error ? err : undefined)
    showDangerToast('レシピの読み込みに失敗しました')
  } finally {
    loaded.value = true
  }
})

const navigateTo = (path: string) => router.push(path)
</script>
