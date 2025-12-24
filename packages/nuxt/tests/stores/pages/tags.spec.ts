import { describe, it, expect, vi } from 'vitest'
import { useTagsPageStore } from '~/stores/pages/tags'
import { useTagsStore } from '~/stores/data/tags'

const internal = { fetchTags: vi.fn(), createTag: vi.fn(), updateTag: vi.fn(), deleteTag: vi.fn() }
vi.mock('~/stores/data/tags', () => ({ useTagsStore: () => internal }))

const showDangerToast = vi.fn()
vi.mock('~/composables/useAppToast', () => ({ useAppToast: () => ({ showDangerToast }) }))

describe('tags page store', () => {
  it('fetchTags handles errors with toast and logging', async () => {
    const internal = useTagsStore()
    ;(internal.fetchTags as unknown as vi.Mock).mockRejectedValue(new Error('API down'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const store = useTagsPageStore()
    await store.fetchTags()

    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(showDangerToast).toHaveBeenCalledWith('タグの読み込みに失敗しました')

    consoleErrorSpy.mockRestore()
  })
})
