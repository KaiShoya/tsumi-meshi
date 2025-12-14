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

describe('Recipes search endpoint (integration)', () => {
  it('GET /recipes?q=sushi returns matching recipes', async () => {
    const mockDB = {
      prepare: (sql: string) => ({
        bind: (_: unknown) => {
          if (sql.includes('LIKE')) {
            return { all: async () => ({ results: [{ id: 1, title: 'Sushi', tags: 'sushi', created_at: '2025-01-01' }] }) }
          }
          return { all: async () => ({ results: [] }) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/recipes?q=sushi', { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.recipes)).toBe(true)
    expect(body.recipes[0].title).toBe('Sushi')
  })

  it('GET /recipes?folderId=5 filters by folder', async () => {
    const mockDB = {
      prepare: (sql: string) => ({
        bind: (_: unknown) => {
          if (sql.includes('r.folder_id')) {
            return { all: async () => ({ results: [{ id: 2, title: 'Ramen', folder_id: 5, tags: '', created_at: '2025-01-02' }] }) }
          }
          return { all: async () => ({ results: [] }) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/recipes?folderId=5', { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.recipes[0].folder_id).toBe(5)
  })

  it('GET /recipes?tagIds=1,2 filters by tags', async () => {
    const mockDB = {
      prepare: (sql: string) => ({
        bind: (_: unknown) => {
          if (sql.includes('EXISTS')) {
            return { all: async () => ({ results: [{ id: 3, title: 'Tempura', tags: 'tempura', created_at: '2025-01-03' }] }) }
          }
          return { all: async () => ({ results: [] }) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/recipes?tagIds=1,2', { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.recipes[0].title).toBe('Tempura')
  })
})
