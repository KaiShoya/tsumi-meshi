import type { Bindings } from '../types'

export const registerTagsRoutes = (app: Hono<{ Bindings: Bindings }>, jwtMiddleware: MiddlewareHandler<{ Bindings: Bindings }>) => {
  app.get('/tags', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const tags = await c.env.DB.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name').bind(userId).all()
      return c.json({ tags: tags.results })
    } catch (error) {
      console.error('Get tags error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.post('/tags', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const { name } = await c.req.json()
      if (!name) return c.json({ error: 'Name is required' }, 400)

      const result = await c.env.DB.prepare('INSERT INTO tags (user_id, name) VALUES (?, ?)').bind(userId, name).run()
      const tagId = result.meta?.last_row_id
      const tag = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?').bind(tagId).first()
      return c.json({ tag })
    } catch (error) {
      console.error('Create tag error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.put('/tags/:id', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const id = Number(c.req.param('id'))
      const { name } = await c.req.json()
      const result = await c.env.DB.prepare('UPDATE tags SET name = COALESCE(?, name) WHERE id = ? AND user_id = ?').bind(name || null, id, userId).run()
      if (result.changes === 0) return c.json({ error: 'Tag not found' }, 404)
      const tag = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?').bind(id).first()
      return c.json({ tag })
    } catch (error) {
      console.error('Update tag error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.delete('/tags/:id', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const id = Number(c.req.param('id'))
      const result = await c.env.DB.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?').bind(id, userId).run()
      if (result.changes === 0) return c.json({ error: 'Tag not found' }, 404)
      return c.json({ success: true })
    } catch (error) {
      console.error('Delete tag error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.post('/tags/find-or-create', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const { name } = await c.req.json()
      if (!name) return c.json({ error: 'Name is required' }, 400)
      const existing = await c.env.DB.prepare('SELECT * FROM tags WHERE user_id = ? AND name = ?').bind(userId, name).first()
      if (existing) return c.json({ tag: existing })
      const result = await c.env.DB.prepare('INSERT INTO tags (user_id, name) VALUES (?, ?)').bind(userId, name).run()
      const tagId = result.meta?.last_row_id
      const tag = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?').bind(tagId).first()
      return c.json({ tag })
    } catch (error) {
      console.error('Find or create tag error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })
}
