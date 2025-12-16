import { jwt } from 'hono/jwt'

// Keep the same binding-name usage as before so Hono can resolve the secret from bindings
export function createJwtMiddleware() {
  return jwt({ secret: 'JWT_SECRET' })
}
