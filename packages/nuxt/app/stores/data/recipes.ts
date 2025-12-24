import { defineStore } from 'pinia'
import { apiClient } from '~/utils/api/client'
import type { Recipe, RecipeInput, RecipeUpdate } from '~/types/recipes'

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
    const res = await apiClient.createRecipe({
      title: recipe.title,
      url: recipe.url,
      description: recipe.description,
      folderId: recipe.folderId
    })
    const newRecipe = res.recipe as Recipe
    recipes.value.push(newRecipe)
    return newRecipe
  }

  const updateRecipe = async (id: number, recipe: RecipeUpdate) => {
    const res = await apiClient.updateRecipe(id, recipe)
    const updatedRecipe = res.recipe as Recipe
    recipes.value = recipes.value.map(r => (r.id === id ? updatedRecipe : r))
    return updatedRecipe
  }

  const deleteRecipe = async (id: number) => {
    await apiClient.deleteRecipe(id)
    recipes.value = recipes.value.filter(r => r.id !== id)
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
