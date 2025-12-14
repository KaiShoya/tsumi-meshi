import { describe, it, expect } from 'vitest'
import app from '../../src/index'
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

describe('Recipes search edge cases (integration)', () => {
  it('GET /recipes with no tagIds returns base results', async () => {
    const mockDB = {
      prepare: (_sql: string) => ({
        bind: (_: unknown) => {
          // If no tag filter present, return a simple list
          return { all: async () => ({ results: [{ id: 10, title: 'Plain Recipe', tags: '', created_at: '2025-01-10' }] }) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/recipes', { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.recipes[0].title).toBe('Plain Recipe')
  })

  it('GET /recipes with large tagIds list handles correctly', async () => {
    const mockDB = {
      prepare: (_sql: string) => ({
        bind: (_: unknown) => {
          if (_sql.includes('EXISTS')) {
            return { all: async () => ({ results: [{ id: 11, title: 'ManyTags', tags: 'a,b,c', created_at: '2025-01-11' }] }) }
          }
          return { all: async () => ({ results: [] }) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    // generate a long list of tag ids
    const ids = Array.from({ length: 100 }, (_, i) => i + 1).join(',')
    const req = new Request(`http://localhost/recipes?tagIds=${ids}`, { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.recipes[0].title).toBe('ManyTags')
  })

  it('GET /recipes with SQL-like q param does not break (sanity)', async () => {
    const mockDB = {
      prepare: (_sql: string) => ({
        bind: (_: unknown) => ({ all: async () => ({ results: [{ id: 12, title: 'Safe', tags: '', created_at: '2025-01-12' }] }) })
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const malicious = `'; DROP TABLE recipes; --`
    const req = new Request(`http://localhost/recipes?q=${encodeURIComponent(malicious)}`, { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.recipes[0].title).toBe('Safe')
  })
})
