import type { Bindings } from '../types'

export const registerChecksRoutes = (app: Hono<{ Bindings: Bindings }>, jwtMiddleware: MiddlewareHandler<{ Bindings: Bindings }>) => {
  app.get('/recipes/:id/checks', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const recipeId = Number(c.req.param('id'))
      const recipe = await c.env.DB.prepare('SELECT id FROM recipes WHERE id = ? AND user_id = ?').bind(recipeId, userId).first()
      if (!recipe) return c.json({ error: 'Recipe not found' }, 404)
      const checks = await c.env.DB.prepare('SELECT * FROM recipe_checks WHERE recipe_id = ? ORDER BY checked_at DESC').bind(recipeId).all()
      return c.json({ checks: checks.results })
    } catch (error) {
      console.error('Get checks error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.post('/recipes/:id/checks', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const recipeId = Number(c.req.param('id'))
      const recipe = await c.env.DB.prepare('SELECT id FROM recipes WHERE id = ? AND user_id = ?').bind(recipeId, userId).first()
      if (!recipe) return c.json({ error: 'Recipe not found' }, 404)
      const result = await c.env.DB.prepare('INSERT INTO recipe_checks (recipe_id) VALUES (?)').bind(recipeId).run()
      const checkId = result.meta?.last_row_id
      const check = await c.env.DB.prepare('SELECT * FROM recipe_checks WHERE id = ?').bind(checkId).first()
      return c.json({ check })
    } catch (error) {
      console.error('Create check error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.get('/checks/stats', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const period = c.req.query('period') || 'month'
      const dateFilter = period === 'month' ? 'date(\'now\', \'-1 month\')' : 'date(\'now\', \'-7 days\')'
      const totalRes = await c.env.DB.prepare('SELECT COUNT(*) as count FROM recipe_checks rc JOIN recipes r ON rc.recipe_id = r.id WHERE r.user_id = ?').bind(userId).first()
      const periodRes = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM recipe_checks rc JOIN recipes r ON rc.recipe_id = r.id WHERE r.user_id = ? AND rc.checked_at >= ${dateFilter}`).bind(userId).first()
      return c.json({ totalChecks: totalRes?.count || 0, periodChecks: periodRes?.count || 0 })
    } catch (error) {
      console.error('Get checks stats error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })
}
