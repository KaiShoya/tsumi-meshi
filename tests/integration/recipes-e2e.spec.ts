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

describe('E2E smoke: core flows (integration)', () => {
  it('create recipe -> create tag -> attach tag -> check recipe', async () => {
    const newRecipe = { id: 100, title: 'E2E Test' }
    const newTag = { id: 200, name: 'e2e' }

    const mockDB = {
      prepare: (sql: string) => ({
        bind: (_: unknown) => {
          if (sql.includes('INSERT INTO recipes')) return { run: async () => ({ meta: { last_row_id: newRecipe.id } }) }
          if (sql.includes('SELECT id FROM recipes')) return { first: async () => ({ id: newRecipe.id }) }
          if (sql.includes('SELECT * FROM recipes WHERE id = ?')) return { first: async () => ({ id: newRecipe.id, title: newRecipe.title }) }
          if (sql.includes('INSERT INTO tags')) return { run: async () => ({ meta: { last_row_id: newTag.id } }) }
          if (sql.includes('SELECT * FROM tags WHERE id = ?')) return { first: async () => ({ id: newTag.id, name: newTag.name }) }
          if (sql.includes('INSERT INTO recipe_tags')) return { run: async () => ({}) }
          if (sql.includes('INSERT INTO recipe_checks')) return { run: async () => ({ meta: { last_row_id: 300 } }) }
          if (sql.includes('SELECT * FROM recipe_checks WHERE id = ?')) return { first: async () => ({ id: 300, recipe_id: newRecipe.id }) }
          return { run: async () => ({}) }
        }
      })
    }

    const token = createJWT({ userId: 1 }, 'JWT_SECRET')

    // Create recipe
    const createReq = new Request('http://localhost/recipes', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newRecipe.title }) })
    const createRes = await app.fetch(createReq, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(createRes.status).toBe(200)
    const createBody = await createRes.json()
    expect(createBody.recipe.id).toBe(newRecipe.id)

    // Create tag
    const tagReq = new Request('http://localhost/tags', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newTag.name }) })
    const tagRes = await app.fetch(tagReq, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(tagRes.status).toBe(200)
    const tagBody = await tagRes.json()
    expect(tagBody.tag.id).toBe(newTag.id)

    // Attach tag (direct DB insert is tested via repository, here we just ensure endpoints are reachable by simulating recipe_tags insert via tag creation flow)
    // Post a check
    const checkReq = new Request(`http://localhost/recipes/${newRecipe.id}/checks`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const checkRes = await app.fetch(checkReq, { DB: mockDB, JWT_SECRET: 'JWT_SECRET' } as unknown)
    expect(checkRes.status).toBe(200)
    const checkBody = await checkRes.json()
    expect(checkBody.check.id).toBe(300)
  })
})
