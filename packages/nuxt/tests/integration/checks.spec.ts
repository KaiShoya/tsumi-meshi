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

describe('Recipe Checks API (integration)', () => {
  it('GET /recipes/:id/checks returns checks list', async () => {
    const mockDB = {
      prepare: (q: string) => ({
        bind: (_: unknown) => {
          if (q.includes('SELECT id FROM recipes')) {
            return { first: async () => ({ id: 1 }) }
          }
          if (q.includes('SELECT * FROM recipe_checks')) {
            return { all: async () => ({ results: [{ id: 1, recipe_id: 1, checked_at: '2025-01-01' }] }) }
          }
          return { all: async () => ({ results: [] }) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/api/v1/recipes/1/checks', { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.checks)).toBe(true)
    expect(body.checks[0].id).toBe(1)
  })

  it('POST /recipes/:id/checks creates a check', async () => {
    const newCheck = { id: 2, recipe_id: 1, checked_at: '2025-01-02' }
    const mockDB = {
      prepare: (q: string) => ({
        bind: (_: unknown) => {
          if (q.includes('SELECT id FROM recipes')) return { first: async () => ({ id: 1 }) }
          if (q.includes('INSERT INTO recipe_checks')) return { run: async () => ({ meta: { last_row_id: newCheck.id } }) }
          if (q.includes('SELECT * FROM recipe_checks WHERE id = ?')) return { first: async () => newCheck }
          return { run: async () => ({}) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/api/v1/recipes/1/checks', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.check.id).toBe(2)
  })

  it('GET /checks/stats returns aggregated stats', async () => {
    const mockDB = {
      prepare: (_q: string) => ({
        bind: (_: unknown) => ({
          first: async () => ({ count: 42 })
        })
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/api/v1/checks/stats?period=month', { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(typeof body.totalChecks).toBe('number')
    expect(body.totalChecks).toBe(42)
  })
})
