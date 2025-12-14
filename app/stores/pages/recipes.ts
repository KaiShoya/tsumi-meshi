import { defineStore } from 'pinia'
import { useRecipesStore } from '~/stores/data/recipes'
import { useToast } from '~/composables/useToast'
import type { RecipeInput, RecipeUpdate } from '~/repositories/recipes'

export const useRecipesPageStore = defineStore('recipesPage', () => {
  const recipesStore = useRecipesStore()
  const { showSuccessToast, showDangerToast } = useToast()
  const { $logger } = useNuxtApp()

  const createRecipe = async (recipe: RecipeInput) => {
    try {
      showLoading()
      await recipesStore.createRecipe(recipe)
      showSuccessToast('レシピを作成しました')
      await fetchRecipes()
    } catch (error) {
      if (error instanceof CustomError) {
        showDangerToast(error.getMessage())
      }
      $logger.error('Failed to create recipe', { module: 'recipesPageStore' }, error)
    } finally {
      hideLoading()
    }
  }

  const updateRecipe = async (id: number, recipe: RecipeUpdate) => {
    try {
      showLoading()
      await recipesStore.updateRecipe(id, recipe)
      showSuccessToast('レシピを更新しました')
      await fetchRecipes()
    } catch (error) {
      if (error instanceof CustomError) {
        showDangerToast(error.getMessage())
      }
      $logger.error('Failed to update recipe', { module: 'recipesPageStore', recipeId: id }, error)
    } finally {
      hideLoading()
    }
  }

  const deleteRecipe = async (id: number, title: string) => {
    try {
      showLoading()
      await recipesStore.deleteRecipe(id)
      showSuccessToast(`レシピ「${title}」を削除しました`)
      await fetchRecipes()
    } catch (error) {
      if (error instanceof CustomError) {
        showDangerToast(error.getMessage())
      }
      $logger.error('Failed to delete recipe', { module: 'recipesPageStore', recipeId: id }, error)
    } finally {
      hideLoading()
    }
  }

  const searchRecipes = async (query: string) => {
    try {
      showLoading()
      await recipesStore.searchRecipes(query)
    } catch (error) {
      if (error instanceof CustomError) {
        showDangerToast(error.getMessage())
      }
      $logger.error('Failed to search recipes', { module: 'recipesPageStore', query }, error)
    } finally {
      hideLoading()
    }
  }

  // Helper functions
  const fetchRecipes = async () => {
    try {
      await recipesStore.fetchRecipes()
    } catch (error) {
      showDangerToast('レシピの読み込みに失敗しました')
      $logger.error('Failed to fetch recipes', { module: 'recipesPageStore' }, error)
    }
  }

  const showLoading = () => {
    // TODO: Implement global loading state
  }

  const hideLoading = () => {
    // TODO: Implement global loading state
  }

  return {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
    fetchRecipes
  }
})
