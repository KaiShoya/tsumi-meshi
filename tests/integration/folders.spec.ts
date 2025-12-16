import { describe, it, expect } from 'vitest'
import app from '../../workers/index'

// Helper to create HS256 JWT (simple, for tests)
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

describe('Folders API (integration)', () => {
  it('GET /folders returns list', async () => {
    const mockDB = {
      prepare: (_q: string) => ({
        bind: (_: unknown) => ({
          all: async () => ({ results: [{ id: 1, user_id: 1, name: 'Inbox' }] })
        })
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/folders', { headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    if (res.status !== 200) console.error('GET /folders response:', await res.text())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.folders)).toBe(true)
    expect(body.folders[0].name).toBe('Inbox')
  })

  it('POST /folders creates a folder', async () => {
    const folder = { id: 5, user_id: 1, name: 'Recipes', parent_id: null }
    const mockDB = {
      prepare: (q: string) => ({
        bind: (_: unknown) => {
          if (q.includes('INSERT INTO folders')) {
            return { run: async () => ({ meta: { last_row_id: folder.id } }) }
          }
          if (q.includes('SELECT * FROM folders WHERE id = ?')) {
            return { first: async () => folder }
          }
          return { run: async () => ({}) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/folders', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Recipes', parentId: null })
    })

    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.folder).toBeDefined()
    expect(body.folder.name).toBe('Recipes')
  })

  it('PUT /folders/:id updates a folder', async () => {
    const folder = { id: 6, user_id: 1, name: 'Old', parent_id: null }
    const updated = { ...folder, name: 'New' }
    const mockDB = {
      prepare: (q: string) => ({
        bind: (_: unknown) => {
          if (q.includes('UPDATE folders')) {
            return { run: async () => ({ changes: 1 }) }
          }
          if (q.includes('SELECT * FROM folders WHERE id = ?')) {
            return { first: async () => updated }
          }
          return { run: async () => ({}) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/folders/6', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New' })
    })

    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.folder.name).toBe('New')
  })

  it('DELETE /folders/:id deletes a folder', async () => {
    const mockDB = {
      prepare: (_q: string) => ({
        bind: (_: unknown) => ({ run: async () => ({ changes: 1 }) })
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')
    const req = new Request('http://localhost/folders/6', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    const res = await app.fetch(req, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
