import type { Bindings } from '../types'

export const registerStatsRoutes = (app: Hono<{ Bindings: Bindings }>, jwtMiddleware: MiddlewareHandler<{ Bindings: Bindings }>) => {
  app.get('/stats', jwtMiddleware, async (c) => {
    try {
      const payload = c.get('jwtPayload')
      const userId = payload.userId
      const range = c.req.query('range') || '30d'

      const totalRecipesRes = await c.env.DB.prepare('SELECT COUNT(*) as count FROM recipes WHERE user_id = ?').bind(userId).first()
      const totalChecksRes = await c.env.DB.prepare('SELECT COUNT(*) as count FROM recipe_checks rc JOIN recipes r ON rc.recipe_id = r.id WHERE r.user_id = ?').bind(userId).first()
      const activeTagsRes = await c.env.DB.prepare('SELECT COUNT(*) as count FROM tags WHERE user_id = ?').bind(userId).first()

      const summary = {
        totalRecipes: totalRecipesRes?.count || 0,
        totalChecks: totalChecksRes?.count || 0,
        activeTags: activeTagsRes?.count || 0
      }

      let dateOffset = '\'-30 days\''
      if (range === '90d') dateOffset = '\'-90 days\''
      if (range === '365d') dateOffset = '\'-365 days\''

      const checksSql = `SELECT date(rc.checked_at) as date, COUNT(*) as count FROM recipe_checks rc JOIN recipes r ON rc.recipe_id = r.id WHERE r.user_id = ? AND rc.checked_at >= date('now', ${dateOffset}) GROUP BY date ORDER BY date ASC`
      const checksRes = await c.env.DB.prepare(checksSql).bind(userId).all()

      const topTagsSql = `SELECT t.name as tag, COUNT(*) as count FROM recipe_tags rt JOIN tags t ON rt.tag_id = t.id JOIN recipes r ON rt.recipe_id = r.id WHERE r.user_id = ? GROUP BY t.id ORDER BY count DESC LIMIT 10`
      const topTagsRes = await c.env.DB.prepare(topTagsSql).bind(userId).all()

      const recentSql = 'SELECT id, title, created_at FROM recipes WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
      const recentRes = await c.env.DB.prepare(recentSql).bind(userId).all()

      return c.json({ summary, checksOverTime: checksRes.results || [], topTags: topTagsRes.results || [], recentRecipes: recentRes.results || [] })
    } catch (error) {
      console.error('Get stats error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })
}
