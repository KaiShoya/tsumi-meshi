import { describe, it, expect, vi } from 'vitest'
import { useTagsStore } from '~/stores/data/tags'
import { apiClient } from '~/utils/api/client'

vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getTags: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn()
  }
}))

describe('tags store', () => {
  it('fetches tags and sets state', async () => {
    const mocked = apiClient.getTags as unknown as vi.Mock
    mocked.mockResolvedValue({ tags: [{ id: 1, name: 'Sushi' }] })

    const store = useTagsStore()
    await store.fetchTags()

    expect(store.tags.length).toBe(1)
    expect(store.tags[0].name).toBe('Sushi')
  })

  it('creates a tag and appends to state', async () => {
    const mocked = apiClient.createTag as unknown as vi.Mock
    mocked.mockResolvedValue({ tag: { id: 2, name: 'Ramen' } })

    const store = useTagsStore()
    const t = await store.createTag({ name: 'Ramen' })

    expect(t.id).toBe(2)
    expect(store.tags.find(x => x.id === 2)).toBeDefined()
  })

  it('updates a tag and replaces state', async () => {
    const mocked = apiClient.updateTag as unknown as vi.Mock
    mocked.mockResolvedValue({ tag: { id: 3, name: 'Updated' } })

    const store = useTagsStore()
    const createMock = apiClient.createTag as unknown as vi.Mock
    createMock.mockResolvedValue({ tag: { id: 3, userId: 1, name: 'Old', createdAt: new Date() } })
    await store.createTag({ name: 'Old' })

    const updated = await store.updateTag(3, 'Updated')

    expect(updated.name).toBe('Updated')
    expect(store.tags.find(x => x.id === 3)?.name).toBe('Updated')
  })

  it('deletes a tag and removes from state', async () => {
    const mocked = apiClient.deleteTag as unknown as vi.Mock
    mocked.mockResolvedValue({})

    const store = useTagsStore()
    store.$patch({ tags: [{ id: 4, userId: 1, name: 'ToDelete', createdAt: new Date() }] })

    await store.deleteTag(4)

    expect(store.tags.find(x => x.id === 4)).toBeUndefined()
  })
})
