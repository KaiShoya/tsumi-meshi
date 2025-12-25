import type { Bindings } from '../types'

export const registerRecipesRoutes = (app: Hono<{ Bindings: Bindings }>, jwtMiddleware: MiddlewareHandler<{ Bindings: Bindings }>) => {
  app.get('/recipes', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const q = c.req.query('q')
      const folderId = c.req.query('folderId')
      const tagIds = c.req.query('tagIds')

      let sql = `SELECT r.*, GROUP_CONCAT(t.name) as tags
       FROM recipes r
       LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
       LEFT JOIN tags t ON rt.tag_id = t.id
       WHERE r.user_id = ?`
      const params: unknown[] = [userId]

      if (q) {
        sql += ` AND (r.title LIKE ? OR r.description LIKE ? OR r.url LIKE ?)`
        const like = `%${q}%`
        params.push(like, like, like)
      }

      if (folderId) {
        sql += ` AND r.folder_id = ?`
        params.push(Number(folderId))
      }

      if (tagIds) {
        const ids = String(tagIds).split(',').map(s => Number(s)).filter(n => !Number.isNaN(n))
        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',')
          sql += ` AND EXISTS (SELECT 1 FROM recipe_tags rt2 WHERE rt2.recipe_id = r.id AND rt2.tag_id IN (${placeholders}))`
          params.push(...ids)
        }
      }

      sql += ` GROUP BY r.id ORDER BY r.created_at DESC`
      const recipes = await c.env.DB.prepare(sql).bind(...params).all()
      return c.json({ recipes: recipes.results })
    } catch (error) {
      console.error('Get recipes error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.post('/recipes', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const { title, url, description, folderId, imageUrl } = await c.req.json()

      // D1 does not accept `undefined` as a bind value. Normalize optional fields to null or proper types.
      const parsedFolderId = folderId != null ? Number(folderId) : null
      const folderIdValue = (parsedFolderId != null && !Number.isNaN(parsedFolderId)) ? parsedFolderId : null
      const descriptionValue = description ?? null
      const imageUrlValue = imageUrl ?? null

      const result = await c.env.DB.prepare(
        'INSERT INTO recipes (user_id, folder_id, title, url, description, image_url) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(userId, folderIdValue, title, url, descriptionValue, imageUrlValue).run()

      const recipeId = result.meta?.last_row_id
      const recipe = await c.env.DB.prepare('SELECT * FROM recipes WHERE id = ?').bind(recipeId).first()
      return c.json({ recipe })
    } catch (error) {
      console.error('Create recipe error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.get('/recipes/:id', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const recipeId = Number(c.req.param('id'))
      const recipe = await c.env.DB.prepare('SELECT * FROM recipes WHERE id = ? AND user_id = ?').bind(recipeId, userId).first()
      if (!recipe) return c.json({ error: 'Not found' }, 404)
      return c.json({ recipe })
    } catch (error) {
      console.error('Get recipe error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.put('/recipes/:id', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const recipeId = Number(c.req.param('id'))
      const body = await c.req.json()
      const { title, url, description, folderId, imageUrl } = body

      await c.env.DB.prepare('UPDATE recipes SET title = ?, url = ?, description = ?, folder_id = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').bind(title, url, description ?? null, folderId ?? null, imageUrl ?? null, recipeId, userId).run()
      const recipe = await c.env.DB.prepare('SELECT * FROM recipes WHERE id = ?').bind(recipeId).first()
      return c.json({ recipe })
    } catch (error) {
      console.error('Update recipe error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })
}
