import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TagsPage from '~/pages/tags/index.vue'
import * as axe from 'axe-core'

vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getTags: vi.fn().mockResolvedValue({ tags: [{ id: 1, name: 'Breakfast' }, { id: 2, name: 'Dinner' }] })
  }
}))

describe('Tags page accessibility', () => {
  it('has no obvious a11y violations (axe)', async () => {
    const wrapper = mount(TagsPage, { attachTo: document.body })
    await Promise.resolve()
    const results = await axe.run(wrapper.element as Element)
    if (results.violations && results.violations.length > 0) console.log('AXE violations:', JSON.stringify(results.violations, null, 2))
    expect(results.violations).toHaveLength(0)
  })
})
