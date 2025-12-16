import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { logger } from 'hono/logger'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', cors())
app.use('*', logger())

// JWT middleware for protected routes
const jwtMiddleware = jwt({ secret: 'JWT_SECRET' })

// Health check
app.get('/health', c => c.json({ status: 'ok' }))

// Auth routes
app.post('/auth/register', async (c) => {
  try {
    const { email, name, password } = await c.req.json()

    // Validate input
    if (!email || !name || !password) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Check if user exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409)
    }

    // Hash password (simplified for demo - not stored for demo purposes)

    // Create user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, name) VALUES (?, ?)'
    ).bind(email, name).run()

    const userId = result.meta?.last_row_id

    // Generate JWT
    const payload = {
      userId,
      email,
      name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }

    const header = { alg: 'HS256', typ: 'JWT' }
    const jwtToken = await createJWT(header, payload, c.env.JWT_SECRET)

    return c.json({
      user: { id: userId, email, name },
      token: jwtToken
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Missing credentials' }, 400)
    }

    // Get user
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Verify password (simplified for demo - not verified for demo purposes)
    // In real implementation, compare with stored hash
    // For demo, we'll accept any password for existing users

    // Generate JWT
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }

    const header = { alg: 'HS256', typ: 'JWT' }
    const jwtToken = await createJWT(header, payload, c.env.JWT_SECRET)

    return c.json({
      user: { id: user.id, email: user.email, name: user.name },
      token: jwtToken
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Protected routes
app.get('/auth/me', jwtMiddleware, async (c) => {
  const payload = c.get('jwtPayload')
  return c.json({ user: payload })
})

// Recipe routes (protected)
app.get('/recipes', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const userId = payload.userId
    // Optional filters
    const q = c.req.query('q')
    const folderId = c.req.query('folderId')
    const tagIds = c.req.query('tagIds')

    // Base query
    let sql = `SELECT r.*, GROUP_CONCAT(t.name) as tags
       FROM recipes r
       LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
       LEFT JOIN tags t ON rt.tag_id = t.id
       WHERE r.user_id = ?`
    const params: unknown[] = [userId]

    // Search query
    if (q) {
      sql += ` AND (r.title LIKE ? OR r.description LIKE ? OR r.url LIKE ?)`
      const like = `%${q}%`
      params.push(like, like, like)
    }

    // Folder filter
    if (folderId) {
      sql += ` AND r.folder_id = ?`
      params.push(Number(folderId))
    }

    // Tag filter (comma-separated ids)
    if (tagIds) {
      const ids = String(tagIds).split(',').map(s => Number(s)).filter(n => !Number.isNaN(n))
      if (ids.length > 0) {
        // Use EXISTS to filter recipes that have at least one of the specified tags
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

    const result = await c.env.DB.prepare(
      'INSERT INTO recipes (user_id, folder_id, title, url, description, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(userId, folderId, title, url, description, imageUrl ?? null).run()

    const recipeId = result.meta?.last_row_id

    const recipe = await c.env.DB.prepare(
      'SELECT * FROM recipes WHERE id = ?'
    ).bind(recipeId).first()

    return c.json({ recipe })
  } catch (error) {
    console.error('Create recipe error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get recipe by id
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

// Update recipe
app.put('/recipes/:id', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const userId = payload.userId
    const recipeId = Number(c.req.param('id'))
    const body = await c.req.json()
    const { title, url, description, folderId, imageUrl } = body

    await c.env.DB.prepare(
      'UPDATE recipes SET title = ?, url = ?, description = ?, folder_id = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
    ).bind(title, url, description ?? null, folderId ?? null, imageUrl ?? null, recipeId, userId).run()

    const recipe = await c.env.DB.prepare('SELECT * FROM recipes WHERE id = ?').bind(recipeId).first()
    return c.json({ recipe })
  } catch (error) {
    console.error('Update recipe error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Tag routes (protected)
app.get('/tags', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const userId = payload.userId

    const tags = await c.env.DB.prepare(
      `SELECT * FROM tags WHERE user_id = ? ORDER BY name`
    ).bind(userId).all()

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

    const result = await c.env.DB.prepare(
      'INSERT INTO tags (user_id, name) VALUES (?, ?)'
    ).bind(userId, name).run()

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

    const result = await c.env.DB.prepare(
      'UPDATE tags SET name = COALESCE(?, name) WHERE id = ? AND user_id = ?'
    ).bind(name || null, id, userId).run()

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

    // Try to find existing tag
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

// Checks routes (protected)
app.get('/recipes/:id/checks', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const userId = payload.userId
    const recipeId = Number(c.req.param('id'))

    // Verify ownership
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

    return c.json({
      totalChecks: totalRes?.count || 0,
      periodChecks: periodRes?.count || 0
    })
  } catch (error) {
    console.error('Get checks stats error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Folder routes (protected)
app.get('/folders', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const userId = payload.userId

    const folders = await c.env.DB.prepare(
      `SELECT * FROM folders WHERE user_id = ? ORDER BY name`
    ).bind(userId).all()

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

    const res = await c.env.DB.prepare(
      `SELECT * FROM folders WHERE user_id = ? ORDER BY name`
    ).bind(userId).all()

    const folders = res.results as Array<{ id: number, user_id: number, name: string, parent_id?: number | null, created_at?: string, updated_at?: string }>

    // Build simple hierarchy
    type FolderNode = { id: number, user_id: number, name: string, parent_id?: number | null, children: FolderNode[] }
    const map = new Map<number, FolderNode>()
    folders.forEach(f => map.set(f.id, { id: f.id, user_id: f.user_id, name: f.name, parent_id: f.parent_id ?? null, children: [] }))
    const roots: FolderNode[] = []
    folders.forEach((f) => {
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

    const result = await c.env.DB.prepare(
      'INSERT INTO folders (user_id, name, parent_id) VALUES (?, ?, ?)'
    ).bind(userId, name, parentId || null).run()

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

    const result = await c.env.DB.prepare(
      'UPDATE folders SET name = COALESCE(?, name), parent_id = ? WHERE id = ? AND user_id = ?'
    ).bind(name || null, parentId || null, id, userId).run()

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

// Helper function to create JWT (simplified)
async function createJWT(header: Record<string, unknown>, payload: Record<string, unknown>, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header))
  const payloadB64 = btoa(JSON.stringify(payload))

  const message = `${headerB64}.${payloadB64}`
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

  return `${message}.${signatureB64}`
}

// Create a root app and mount the existing app at `/api/v1` so the worker
// can be deployed at the root while still serving versioned routes.
const root = new Hono<{ Bindings: Bindings }>()

// Mount the API under /api/v1
root.route('/api/v1', app)

export default root
