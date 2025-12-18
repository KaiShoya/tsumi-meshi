import { defineStore } from 'pinia'
import { useRecipesStore } from '~/stores/data/recipes'
import { useUiStore } from '~/stores/ui'
import { useAppToast } from '~/composables/useAppToast'
import { useLogger } from '~/composables/useLogger'
import { apiClient } from '~/utils/api/client'
import type { RecipeInput, RecipeUpdate } from '~/repositories/recipes'

export const useRecipesPageStore = defineStore('recipesPage', () => {
  const getRecipesStore = () => useRecipesStore()
  const { showSuccessToast, showDangerToast } = useAppToast()
  const logger = useLogger()

  const createRecipe = async (recipe: RecipeInput) => {
    try {
      showLoading()
      await getRecipesStore().createRecipe(recipe)
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
      await getRecipesStore().updateRecipe(id, recipe)
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
      await getRecipesStore().deleteRecipe(id)
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
      await getRecipesStore().searchRecipes(query)
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
      logger.error('Failed to record check', { module: 'recipesPage', recipeId }, err instanceof Error ? err : new Error(String(err)))
      showDangerToast('チェックの登録に失敗しました')
    } finally {
      hideLoading()
    }
  }

  // Helper functions
  const fetchRecipes = async (opts?: { q?: string, folderId?: number | null, tagIds?: number[] }) => {
    try {
      await getRecipesStore().fetchRecipes(opts)
    } catch (error) {
      showDangerToast('レシピの読み込みに失敗しました')
      logger.error('Failed to fetch recipes', { module: 'recipesPageStore' }, error instanceof Error ? error : new Error(String(error)))
    }
  }

  const ui = useUiStore()

  const showLoading = () => ui.showLoading()

  const hideLoading = () => ui.hideLoading()

  return {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
    fetchRecipes,
    toggleCheck
  }
})
