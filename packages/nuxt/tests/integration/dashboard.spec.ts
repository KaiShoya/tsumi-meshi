import { describe, it, expect } from 'vitest'
import app from '@tsumi-meshi/workers'
import crypto from 'crypto'

function base64url(input: Buffer) {
  return input.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function createJWT(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encoded = `${base64url(Buffer.from(JSON.stringify(header)))}.${base64url(Buffer.from(JSON.stringify(payload)))}`
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest()
  return `${encoded}.${base64url(signature)}`
}

describe('E2E smoke: dashboard /stats', () => {
  it('returns summary, checksOverTime, topTags and recentRecipes', async () => {
    const token = createJWT({ userId: 1 }, 'JWT_SECRET')

    const mockDB = {
      prepare: (sql: string) => ({
        bind: (_: unknown) => {
          // default handlers
          const handlers: Record<string, unknown> = {
            first: async () => ({}),
            all: async () => ({ results: [] }),
            run: async () => ({})
          }

          if (sql.includes('COUNT(*) as count FROM recipes')) {
            handlers.first = async () => ({ count: 5 })
          }
          if (sql.includes('COUNT(*) as count FROM recipe_checks')) {
            handlers.first = async () => ({ count: 42 })
          }
          if (sql.includes('COUNT(*) as count FROM tags')) {
            handlers.first = async () => ({ count: 7 })
          }
          if (sql.includes('FROM recipe_checks')) {
            handlers.all = async () => ({ results: [{ date: '2025-01-01', count: 3 }] })
          }
          if (sql.includes('FROM recipe_tags')) {
            handlers.all = async () => ({ results: [{ tag: 'breakfast', count: 8 }] })
          }
          if (sql.includes('SELECT id, title, created_at FROM recipes')) {
            handlers.all = async () => ({ results: [{ id: 10, title: 'Recent', created_at: '2025-01-02' }] })
          }

          return {
            first: handlers.first as () => Promise<unknown>,
            all: handlers.all as () => Promise<unknown>,
            run: handlers.run as () => Promise<unknown>
          }
        }
      })
    }

    const req = new Request('http://localhost/api/v1/stats', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.summary.totalRecipes).toBe(5)
    expect(body.summary.totalChecks).toBe(42)
    expect(body.summary.activeTags).toBe(7)

    expect(Array.isArray(body.checksOverTime)).toBe(true)
    expect(body.checksOverTime.length).toBeGreaterThanOrEqual(1)

    expect(Array.isArray(body.topTags)).toBe(true)
    expect(body.topTags[0].tag).toBe('breakfast')

    expect(Array.isArray(body.recentRecipes)).toBe(true)
    expect(body.recentRecipes[0].title).toBe('Recent')
  })
})
