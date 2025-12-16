import type { Bindings } from '../types'

export function registerFoldersRoutes(app: Hono<{ Bindings: Bindings }>, jwtMiddleware: MiddlewareHandler<{ Bindings: Bindings }>) {
  app.get('/folders', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const folders = await c.env.DB.prepare('SELECT * FROM folders WHERE user_id = ? ORDER BY name').bind(userId).all()
      return c.json({ folders: folders.results })
    } catch (error) {
      console.error('Get folders error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.get('/folders/hierarchy', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const res = await c.env.DB.prepare('SELECT * FROM folders WHERE user_id = ? ORDER BY name').bind(userId).all()
      type FolderRow = { id: number, user_id: number, name: string, parent_id?: number | null }
      const folders = res.results as FolderRow[]
      type FolderNode = { id: number, user_id: number, name: string, parent_id?: number | null, children: FolderNode[] }
      const map = new Map<number, FolderNode>()
      folders.forEach((f: FolderRow) => map.set(f.id, { id: f.id, user_id: f.user_id, name: f.name, parent_id: f.parent_id ?? null, children: [] }))
      const roots: FolderNode[] = []
      folders.forEach((f: FolderRow) => {
        const node = map.get(f.id)!
        if (f.parent_id && map.has(f.parent_id)) {
          map.get(f.parent_id)!.children.push(node)
        } else {
          roots.push(node)
        }
      })
      return c.json({ folders: roots })
    } catch (error) {
      console.error('Get folder hierarchy error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.post('/folders', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const { name, parentId } = await c.req.json()
      if (!name) return c.json({ error: 'Name is required' }, 400)
      const result = await c.env.DB.prepare('INSERT INTO folders (user_id, name, parent_id) VALUES (?, ?, ?)').bind(userId, name, parentId || null).run()
      const folderId = result.meta?.last_row_id
      const folder = await c.env.DB.prepare('SELECT * FROM folders WHERE id = ?').bind(folderId).first()
      return c.json({ folder })
    } catch (error) {
      console.error('Create folder error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.put('/folders/:id', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const id = Number(c.req.param('id'))
      const { name, parentId } = await c.req.json()
      const result = await c.env.DB.prepare('UPDATE folders SET name = COALESCE(?, name), parent_id = ? WHERE id = ? AND user_id = ?').bind(name || null, parentId || null, id, userId).run()
      if (result.changes === 0) return c.json({ error: 'Folder not found' }, 404)
      const folder = await c.env.DB.prepare('SELECT * FROM folders WHERE id = ?').bind(id).first()
      return c.json({ folder })
    } catch (error) {
      console.error('Update folder error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.delete('/folders/:id', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const id = Number(c.req.param('id'))
      const result = await c.env.DB.prepare('DELETE FROM folders WHERE id = ? AND user_id = ?').bind(id, userId).run()
      if (result.changes === 0) return c.json({ error: 'Folder not found' }, 404)
      return c.json({ success: true })
    } catch (error) {
      console.error('Delete folder error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })
}
