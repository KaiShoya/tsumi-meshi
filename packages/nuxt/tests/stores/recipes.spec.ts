import { describe, it, expect, vi } from 'vitest'
import { useRecipesStore } from '~/stores/data/recipes'
import { apiClient } from '~/utils/api/client'

vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getRecipes: vi.fn(),
    createRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn()
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

  it('creates a recipe and appends to state', async () => {
    const mocked = apiClient.createRecipe as unknown as vi.Mock
    mocked.mockResolvedValue({ recipe: { id: 10, title: 'New', tags: [], checks: [] } })

    const store = useRecipesStore()
    const r = await store.createRecipe({ title: 'New', url: 'http://', description: '', folderId: undefined })

    expect(r.id).toBe(10)
    expect(store.recipes.find(x => x.id === 10)).toBeDefined()
  })

  it('updates a recipe and replaces state', async () => {
    const mocked = apiClient.updateRecipe as unknown as vi.Mock
    mocked.mockResolvedValue({ recipe: { id: 11, title: 'Updated', tags: [], checks: [] } })

    const store = useRecipesStore()
    const createMock = apiClient.createRecipe as unknown as vi.Mock
    createMock.mockResolvedValue({ recipe: { id: 11, userId: 1, title: 'Old', url: 'http://', tags: [], checks: [], createdAt: new Date(), updatedAt: new Date() } })
    await store.createRecipe({ title: 'Old', url: 'http://', description: '', folderId: undefined })

    const updated = await store.updateRecipe(11, { title: 'Updated' })

    expect(updated.title).toBe('Updated')
    expect(store.recipes.find(x => x.id === 11)?.title).toBe('Updated')
  })

  it('deletes a recipe and removes from state', async () => {
    const mocked = apiClient.deleteRecipe as unknown as vi.Mock
    mocked.mockResolvedValue({})

    const store = useRecipesStore()
    store['recipes'].push({ id: 12, userId: 1, title: 'ToDelete', url: 'http://', tags: [], checks: [], createdAt: new Date(), updatedAt: new Date() })

    await store.deleteRecipe(12)

    expect(store.recipes.find(x => x.id === 12)).toBeUndefined()
  })
})
