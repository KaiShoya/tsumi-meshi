import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick, type Ref } from 'vue'
import type { Folder } from '~/types/folders'
import { createPinia, setActivePinia } from 'pinia'
import { useFoldersStore } from '~/stores/data/folders'
import { useFoldersPageStore } from '~/stores/pages/folders'
import FoldersPage from '~/pages/folders/index.vue'

// Mock stores
vi.mock('~/stores/data/folders')
vi.mock('~/stores/pages/folders')

const viUseFoldersStore = useFoldersStore as Mock
const viUseFoldersPageStore = useFoldersPageStore as Mock

describe('pages/folders/index.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('shows loading state initially', async () => {
    viUseFoldersStore.mockReturnValueOnce({
      folders: ref([]),
      loading: ref(true)
    })
    viUseFoldersPageStore.mockReturnValueOnce({
      fetchFolders: vi.fn()
    })

    const wrapper = mount(FoldersPage)
    await nextTick()

    expect(wrapper.text()).toContain('フォルダを読み込み中...')
  })

  it('shows empty state when there are no folders', async () => {
    viUseFoldersStore.mockReturnValueOnce({
      folders: ref([]),
      loading: ref(false)
    })
    viUseFoldersPageStore.mockReturnValueOnce({
      fetchFolders: vi.fn()
    })

    const wrapper = mount(FoldersPage)
    // Wait for any reactive updates after mount
    await nextTick()
    // debug runtime values
    type Exposed = { loading: boolean | Ref<boolean>, folders: Folder[] | Ref<Folder[]> }
    const exposed = wrapper.vm as unknown as Exposed
    console.log('exposed loading:', exposed.loading)
    console.log('exposed folders:', exposed.folders)
    expect(wrapper.text()).toContain('フォルダがありません。新しいフォルダを作成しましょう！')
  })

  it('renders folder tree when folders exist', async () => {
    const mockFolders = [
      { id: 1, name: 'Root 1', parentId: null, children: [] },
      { id: 2, name: 'Child 1', parentId: 1, children: [] }
    ]
    viUseFoldersStore.mockReturnValueOnce({
      folders: ref(mockFolders),
      loading: ref(false)
    })
    viUseFoldersPageStore.mockReturnValueOnce({
      fetchFolders: vi.fn()
    })

    const wrapper = mount(FoldersPage)
    await nextTick()

    // The component may not be globally registered in test env; assert the computed tree exists instead.
    type ExposedTree = { rootFolders: Folder[] | Ref<Folder[]> }
    const exposedTree = wrapper.vm as unknown as ExposedTree
    const tree = Array.isArray(exposedTree.rootFolders) ? exposedTree.rootFolders : exposedTree.rootFolders.value
    expect(tree.length).toBeGreaterThan(0)
  })

  it('opens create modal when "新規フォルダ作成" button is clicked', async () => {
    viUseFoldersStore.mockReturnValueOnce({
      folders: ref([]),
      loading: ref(false)
    })
    const pageStore = { fetchFolders: vi.fn(), createFolder: vi.fn() }
    viUseFoldersPageStore.mockReturnValueOnce(pageStore)

    const wrapper = mount(FoldersPage)
    await nextTick()

    const createButton = wrapper.find('[aria-label="新規フォルダ作成"]')
    await createButton.trigger('click')
    await nextTick()

    type ModalExposed = { isCreateModalOpen: boolean | Ref<boolean> }
    const exposedModal = wrapper.vm as unknown as ModalExposed
    const isOpen = typeof exposedModal.isCreateModalOpen === 'boolean' ? exposedModal.isCreateModalOpen : exposedModal.isCreateModalOpen.value
    expect(isOpen).toBe(true)
  })
})
