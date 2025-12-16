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
      <div
        v-if="recipe?.imageUrl"
        class="rounded overflow-hidden"
      >
        <img
          :src="recipe.imageUrl"
          :alt="recipe.title"
          class="w-full object-contain"
        >
      </div>

      <div>
        <p class="text-sm text-gray-600">
          {{ recipe?.description }}
        </p>
        <a
          v-if="recipe?.url"
          :href="recipe.url"
          target="_blank"
          rel="noopener"
          class="text-blue-600 underline"
        >
          Open source
        </a>
      </div>

      <div class="flex gap-2">
        <UBadge
          v-for="tag in recipe?.tags ?? []"
          :key="tag.id"
        >
          {{ tag.name }}
        </UBadge>
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
import type { Recipe } from '~/repositories/recipes'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const loaded = ref(false)
const recipe = ref<Recipe | null>(null)

onMounted(async () => {
  try {
    const res = await $fetch(`/api/recipes/${id}`) as { recipe?: Recipe | null }
    recipe.value = res.recipe ?? null
  } catch (err) {
    console.error(err)
  } finally {
    loaded.value = true
  }
})

const navigateTo = (path: string) => router.push(path)
</script>
