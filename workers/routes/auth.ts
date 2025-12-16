import type { Bindings, UserPayload } from '../types'

export function registerAuthRoutes(
  app: Hono<{ Bindings: Bindings }>,
  jwtMiddleware: MiddlewareHandler<{ Bindings: Bindings }>,
  createJWT: (h: Record<string, unknown>, p: Record<string, unknown>, s: string) => Promise<string>
) {
  app.post('/auth/register', async (c) => {
    try {
      const { email, name, password } = await c.req.json()
      if (!email || !name || !password) return c.json({ error: 'Missing required fields' }, 400)

      const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
      if (existingUser) return c.json({ error: 'User already exists' }, 409)

      const result = await c.env.DB.prepare('INSERT INTO users (email, name) VALUES (?, ?)').bind(email, name).run()
      const userId = result.meta?.last_row_id

      const payload: UserPayload = {
        userId,
        email,
        name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      }

      const header = { alg: 'HS256', typ: 'JWT' }
      const jwtToken = await createJWT(header, payload, c.env.JWT_SECRET)

      return c.json({ user: { id: userId, email, name }, token: jwtToken })
    } catch (error) {
      console.error('Registration error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.post('/auth/login', async (c) => {
    try {
      const { email, password } = await c.req.json()
      if (!email || !password) return c.json({ error: 'Missing credentials' }, 400)

      const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
      if (!user) return c.json({ error: 'Invalid credentials' }, 401)

      const payload: UserPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      }

      const header = { alg: 'HS256', typ: 'JWT' }
      const jwtToken = await createJWT(header, payload, c.env.JWT_SECRET)

      return c.json({ user: { id: user.id, email: user.email, name: user.name }, token: jwtToken })
    } catch (error) {
      console.error('Login error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  app.get('/auth/me', jwtMiddleware, async (c) => {
    const payload = c.get('jwtPayload')
    return c.json({ user: payload })
  })
}
