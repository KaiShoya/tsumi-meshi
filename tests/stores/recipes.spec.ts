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
})
