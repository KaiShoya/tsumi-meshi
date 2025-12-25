import { describe, it, expect } from 'vitest'
import app from '@tsumi-meshi/workers'
import crypto from 'crypto'

const base64url = (input: Buffer) => {
  return input.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

const createJWT = (payload: Record<string, unknown>, secret: string) => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encoded = `${base64url(Buffer.from(JSON.stringify(header)))}.${base64url(Buffer.from(JSON.stringify(payload)))}`
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest()
  return `${encoded}.${base64url(signature)}`
}

describe('Tags API (integration)', () => {
  it('GET /tags returns list', async () => {
    const mockDB = {
      prepare: (_sql: string) => ({
        bind: (_: unknown) => ({ all: async () => ({ results: [{ id: 1, name: 'Sushi' }] }) })
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/api/v1/tags', { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.tags)).toBe(true)
    expect(body.tags[0].name).toBe('Sushi')
  })

  it('POST /tags/find-or-create creates when not exists', async () => {
    const mockDB = {
      prepare: (_sql: string) => ({
        bind: (_: unknown) => ({ first: async () => null, run: async () => ({ meta: { last_row_id: 5 } }) })
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/api/v1/tags/find-or-create', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'newtag' }) })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tag).toBeDefined()
  })

  it('PUT /tags/:id updates tag', async () => {
    const mockDB = {
      prepare: (_sql: string) => ({ bind: (_: unknown) => ({ run: async () => ({ changes: 1 }), first: async () => ({ id: 3, name: 'Updated' }) }) })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/api/v1/tags/3', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Updated' }) })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tag.name).toBe('Updated')
  })

  it('DELETE /tags/:id deletes tag', async () => {
    const mockDB = {
      prepare: (_sql: string) => ({ bind: (_: unknown) => ({ run: async () => ({ changes: 1 }) }) })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/api/v1/tags/4', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
