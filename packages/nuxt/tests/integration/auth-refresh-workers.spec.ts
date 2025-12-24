import http from 'node:http'
import type { AddressInfo } from 'net'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Local in-process server that simulates auth endpoints and sets cookies.
describe('auth refresh via local server (Workers-like simulation)', () => {
  let server: http.Server
  let port = 0
  const sessions = new Map<string, unknown>()

  beforeAll(async () => {
    server = http.createServer(async (req, res) => {
      const url = req.url || ''
      if (req.method === 'POST' && url === '/api/auth/login') {
        let body = ''
        for await (const chunk of req) body += chunk
        try {
          const { email } = JSON.parse(body || '{}')
          const token = Math.random().toString(36).slice(2)
          const user = { id: 1, email, name: 'LocalUser' }
          sessions.set(token, user)
          res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=1200`)
          res.setHeader('Content-Type', 'application/json')
          res.writeHead(200)
          res.end(JSON.stringify({ user }))
        } catch {
          res.writeHead(400)
          res.end()
        }
        return
      }

      if (req.method === 'GET' && url === '/api/auth/me') {
        const cookie = req.headers['cookie'] || ''
        const match = /session=([^;\s]+)/.exec(cookie)
        const token = match ? match[1] : null
        const user = token ? sessions.get(token) ?? null : null
        res.setHeader('Content-Type', 'application/json')
        res.writeHead(200)
        res.end(JSON.stringify({ user }))
        return
      }

      if (req.method === 'POST' && url === '/api/auth/logout') {
        const cookie = req.headers['cookie'] || ''
        const match = /session=([^;\s]+)/.exec(cookie)
        const token = match ? match[1] : null
        if (token) sessions.delete(token)
        res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0')
        res.writeHead(204)
        res.end()
        return
      }

      res.writeHead(404)
      res.end()
    })

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address() as AddressInfo | null
        port = addr?.port ?? 0
        resolve()
      })
    })
  })

  afterAll(async () => {
    await new Promise<void>(resolve => server.close(resolve))
  })

  it('login sets cookie and /api/auth/me reflects session', async () => {
    const base = `http://localhost:${port}`

    // initial /me -> null
    const r1 = await fetch(`${base}/api/auth/me`)
    const j1 = await r1.json()
    expect(j1.user).toBeNull()

    // login
    const r2 = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'x@y.com', password: 'pw' })
    })
    expect(r2.status).toBe(200)
    const setcookie = r2.headers.get('set-cookie')
    expect(setcookie).toBeTruthy()

    // extract token
    const tokenMatch = /session=([^;\s]+)/.exec(setcookie || '')
    const token = tokenMatch ? tokenMatch[1] : null
    expect(token).toBeTruthy()

    // subsequent /me with Cookie header should return user
    const r3 = await fetch(`${base}/api/auth/me`, { headers: { cookie: `session=${token}` } })
    const j3 = await r3.json()
    expect(j3.user).toEqual({ id: 1, email: 'x@y.com', name: 'LocalUser' })

    // logout (server clears session)
    const r4 = await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { cookie: `session=${token}` } })
    expect(r4.status).toBe(204)

    // /me after logout -> null
    const r5 = await fetch(`${base}/api/auth/me`, { headers: { cookie: `session=${token}` } })
    const j5 = await r5.json()
    expect(j5.user).toBeNull()
  })
})
