import { describe, it, expect, vi } from 'vitest'
import { FoldersRepository } from '~/repositories/folders'

describe('FoldersRepository', () => {
  it('builds hierarchy from flat list', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = {
      all: vi.fn().mockResolvedValue([
        { id: 1, userId: 1, name: 'Root', parentId: null },
        { id: 2, userId: 1, name: 'Child', parentId: 1 }
      ])
    }

    const repo = new FoldersRepository(db)
    const roots = await repo.getHierarchy(1)

    expect(roots.length).toBe(1)
    expect(roots[0].children.length).toBe(1)
    expect(roots[0].children[0].name).toBe('Child')
  })
})
