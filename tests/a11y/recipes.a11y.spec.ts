import { describe, it, expect, vi } from 'vitest'
import * as axe from 'axe-core'

vi.mock('~/utils/api/client', () => ({
  apiClient: {
    getTags: vi.fn().mockResolvedValue({ tags: [] }),
    getFolders: vi.fn().mockResolvedValue({ folders: [] })
  }
}))

describe('Recipes page accessibility (sanity)', () => {
  it('has no obvious a11y violations for core controls', async () => {
    // Build a small DOM representing header/search/buttons similar to the real page
    const container = document.createElement('div')
    container.innerHTML = `
      <div>
        <h1 class="text-2xl">レシピ一覧</h1>
        <button aria-label="新規レシピ">新規レシピ</button>
        <input placeholder="レシピを検索..." aria-label="search" />
        <div class="cards">
          <article>
            <h2>Test Recipe</h2>
            <p>おいしい料理</p>
            <button aria-label="check">Check</button>
          </article>
        </div>
      </div>
    `
    document.body.appendChild(container)

    const results = await axe.run(container)
    if (results.violations && results.violations.length > 0) console.log('AXE violations:', JSON.stringify(results.violations, null, 2))
    expect(results.violations).toHaveLength(0)
  })
})