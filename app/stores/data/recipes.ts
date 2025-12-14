import { defineStore } from 'pinia'
import { apiClient } from '~/utils/api/client'
import type { Recipe, RecipeInput, RecipeUpdate } from '~/repositories/recipes'

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)

  const fetchRecipes = async (opts?: { q?: string, folderId?: number | null, tagIds?: number[] }) => {
    loading.value = true
    try {
      const res = await apiClient.getRecipes(opts)
      recipes.value = (res.recipes ?? []) as Recipe[]
    } finally {
      loading.value = false
    }
  }

  const createRecipe = async (recipe: RecipeInput) => {
    // TODO: Implement API call
    // const newRecipe = await $recipesRepository.create(recipe, getCurrentUserId())
    // recipes.value.push(newRecipe)
    console.log('Create recipe:', recipe)
  }

  const updateRecipe = async (id: number, recipe: RecipeUpdate) => {
    // TODO: Implement API call
    // const updatedRecipe = await $recipesRepository.update(id, recipe, getCurrentUserId())
    // const index = recipes.value.findIndex(r => r.id === id)
    // if (index !== -1) recipes.value[index] = updatedRecipe
    console.log('Update recipe:', id, recipe)
  }

  const deleteRecipe = async (id: number) => {
    // TODO: Implement API call
    // await $recipesRepository.delete(id, getCurrentUserId())
    // recipes.value = recipes.value.filter(r => r.id !== id)
    console.log('Delete recipe:', id)
  }

  const searchRecipes = async (query: string) => {
    loading.value = true
    try {
      const res = await apiClient.getRecipes({ q: query })
      recipes.value = (res.recipes ?? []) as Recipe[]
    } finally {
      loading.value = false
    }
  }

  return {
    recipes: readonly(recipes),
    loading: readonly(loading),
    fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes
  }
})
