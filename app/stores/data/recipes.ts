import { defineStore } from 'pinia'
import type { Recipe, RecipeInput, RecipeUpdate } from '~/repositories/recipes'

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)

  const fetchRecipes = async () => {
    loading.value = true
    try {
      // TODO: Implement API call to Cloudflare Workers
      // recipes.value = await $recipesRepository.fetchAll(getCurrentUserId())
      recipes.value = [] // Placeholder
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const createRecipe = async (recipe: RecipeInput) => {
    try {
      // TODO: Implement API call
      // const newRecipe = await $recipesRepository.create(recipe, getCurrentUserId())
      // recipes.value.push(newRecipe)
      console.log('Create recipe:', recipe)
    } catch (error) {
      throw error
    }
  }

  const updateRecipe = async (id: number, recipe: RecipeUpdate) => {
    try {
      // TODO: Implement API call
      // const updatedRecipe = await $recipesRepository.update(id, recipe, getCurrentUserId())
      // const index = recipes.value.findIndex(r => r.id === id)
      // if (index !== -1) recipes.value[index] = updatedRecipe
      console.log('Update recipe:', id, recipe)
    } catch (error) {
      throw error
    }
  }

  const deleteRecipe = async (id: number) => {
    try {
      // TODO: Implement API call
      // await $recipesRepository.delete(id, getCurrentUserId())
      // recipes.value = recipes.value.filter(r => r.id !== id)
      console.log('Delete recipe:', id)
    } catch (error) {
      throw error
    }
  }

  const searchRecipes = async (query: string) => {
    try {
      // TODO: Implement API call
      // recipes.value = await $recipesRepository.search(query, getCurrentUserId())
      console.log('Search recipes:', query)
    } catch (error) {
      throw error
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
