import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { createJwtMiddleware } from './middleware/jwt'
import { createJWT } from './utils/jwt'
import { registerAuthRoutes } from './routes/auth'
import { registerRecipesRoutes } from './routes/recipes'
import { registerTagsRoutes } from './routes/tags'
import { registerChecksRoutes } from './routes/checks'
import { registerFoldersRoutes } from './routes/folders'
import { registerStatsRoutes } from './routes/stats'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
// Use CORS with credentials support by echoing the request origin and allowing credentials.
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin') || '*'
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Access-Control-Allow-Credentials', 'true')
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (c.req.method === 'OPTIONS') {
    return c.text('', 204)
  }

  await next()
})
app.use('*', logger())

// JWT middleware for protected routes (factory kept centralized)
const jwtMiddleware = createJwtMiddleware()

// Health check
app.get('/health', c => c.json({ status: 'ok' }))

// Register route modules
registerAuthRoutes(app, jwtMiddleware, createJWT)
registerRecipesRoutes(app, jwtMiddleware)
registerTagsRoutes(app, jwtMiddleware)
registerChecksRoutes(app, jwtMiddleware)
registerFoldersRoutes(app, jwtMiddleware)
registerStatsRoutes(app, jwtMiddleware)

// Create a root app and mount the existing app at `/api/v1` so the worker
// can be deployed at the root while still serving versioned routes.
const root = new Hono<{ Bindings: Bindings }>()
root.route('/api/v1', app)

export default root
