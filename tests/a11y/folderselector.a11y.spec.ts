import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FolderSelector from '~/components/FolderSelector.vue'
import * as axe from 'axe-core'

vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getFolders: vi.fn().mockResolvedValue({ folders: [{ id: 1, name: 'Inbox', parentId: null }] })
  }
}))

describe('FolderSelector accessibility', () => {
  it('has no obvious a11y violations (axe)', async () => {
    const wrapper = mount(FolderSelector, { props: { modelValue: null }, attachTo: document.body })
    // wait microtasks for onMounted fetch to resolve
    await Promise.resolve()
    const results = await axe.run(wrapper.element as Element)
    expect(results.violations).toHaveLength(0)
  })
})
