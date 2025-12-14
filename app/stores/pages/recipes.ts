// @ts-expect-error: Pinia types may not be available in typecheck environment
import { defineStore } from 'pinia'
import { useRecipesStore } from '~/stores/data/recipes'
import { useToast } from '~/composables/useToast'
import { apiClient } from '~/utils/api/client'
import type { RecipeInput, RecipeUpdate } from '~/repositories/recipes'

export const useRecipesPageStore = defineStore('recipesPage', () => {
  const recipesStore = useRecipesStore()
  const { showSuccessToast, showDangerToast } = useToast()
  const logger = useLogger()

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
      logger.error('Failed to create recipe', { module: 'recipesPageStore' }, error instanceof Error ? error : new Error(String(error)))
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
      logger.error('Failed to update recipe', { module: 'recipesPageStore', recipeId: id }, error instanceof Error ? error : undefined)
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
      logger.error('Failed to delete recipe', { module: 'recipesPageStore', recipeId: id }, error instanceof Error ? error : undefined)
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
      logger.error('Failed to search recipes', { module: 'recipesPageStore', query }, error instanceof Error ? error : undefined)
    } finally {
      hideLoading()
    }
  }

  const toggleCheck = async (recipeId: number) => {
    try {
      showLoading()
      await apiClient.createCheck(recipeId)
      showSuccessToast('チェックを記録しました')
      await fetchRecipes()
    } catch (err: unknown) {
      console.error(err)
      showDangerToast('チェックの登録に失敗しました')
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
      logger.error('Failed to fetch recipes', { module: 'recipesPageStore' }, error instanceof Error ? error : new Error(String(error)))
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
    fetchRecipes,
    toggleCheck
  }

  return {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
    fetchRecipes
  }
})
