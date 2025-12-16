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
app.use('*', cors())
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
