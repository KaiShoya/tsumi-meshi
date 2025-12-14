import { describe, it, expect, vi } from 'vitest'
import { useRecipesStore } from '~/stores/data/recipes'
import { apiClient } from '~/utils/api/client'

vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getRecipes: vi.fn()
  }
}))

describe('recipes store', () => {
  it('fetches recipes and sets state', async () => {
    const mocked = apiClient.getRecipes as unknown as vi.Mock
    mocked.mockResolvedValue({ recipes: [{ id: 1, title: 'Test', tags: [], checks: [] }] })

    const store = useRecipesStore()
    await store.fetchRecipes()

    expect(store.recipes.length).toBe(1)
    expect(store.recipes[0].title).toBe('Test')
  })

  it('searches recipes by query and updates state', async () => {
    const mocked = apiClient.getRecipes as unknown as vi.Mock
    mocked.mockResolvedValue({ recipes: [{ id: 2, title: 'Sushi', tags: [], checks: [] }] })

    const store = useRecipesStore()
    await store.searchRecipes('sushi')

    expect(mocked).toHaveBeenCalledWith({ q: 'sushi' })
    expect(store.recipes.length).toBe(1)
    expect(store.recipes[0].title).toBe('Sushi')
  })

  it('fetches recipes with folderId and tagIds filters', async () => {
    const mocked = apiClient.getRecipes as unknown as vi.Mock
    mocked.mockResolvedValue({ recipes: [{ id: 3, title: 'Ramen', tags: [], checks: [] }] })

    const store = useRecipesStore()
    await store.fetchRecipes({ folderId: 5, tagIds: [1, 2] })

    expect(mocked).toHaveBeenCalledWith({ folderId: 5, tagIds: [1, 2] })
    expect(store.recipes[0].title).toBe('Ramen')
  })

  it('handles API errors and resets loading state', async () => {
    const mocked = apiClient.getRecipes as unknown as vi.Mock
    mocked.mockRejectedValue(new Error('API failure'))

    const store = useRecipesStore()
    await expect(store.fetchRecipes()).rejects.toThrow('API failure')
    expect(store.loading).toBe(false)
  })
})
