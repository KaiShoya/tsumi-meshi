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

    const recipes = await c.env.DB.prepare(
      `SELECT r.*, GROUP_CONCAT(t.name) as tags
       FROM recipes r
       LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
       LEFT JOIN tags t ON rt.tag_id = t.id
       WHERE r.user_id = ?
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    ).bind(userId).all()

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
    const { title, url, description, folderId } = await c.req.json()

    const result = await c.env.DB.prepare(
      'INSERT INTO recipes (user_id, folder_id, title, url, description) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, folderId, title, url, description).run()

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

export default app
