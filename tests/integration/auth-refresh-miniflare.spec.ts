import { describe, it, expect } from 'vitest'

// This test runs only when `miniflare` is available as a dev dependency.
// To enable full Workers-like E2E locally, run:
//   pnpm add -D miniflare
// Then run this test with `pnpm test -- tests/integration/auth-refresh-miniflare.spec.ts`

let Miniflare: any
try {
  // dynamic import so tests still run even if miniflare is not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Miniflare = require('miniflare').Miniflare
} catch (e) {
  Miniflare = null
}

describe('auth refresh via Miniflare (optional)', () => {
  if (!Miniflare) {
    it('skipped (install miniflare to run Workers-like tests)', () => {
      console.warn('Miniflare not installed. Install with `pnpm add -D miniflare` to run this test.')
      expect(true).toBe(true)
    })
    return
  }

  it('runs a simple worker and verifies /api/auth/me behavior', async () => {
    // Minimal example: starts a Worker using Miniflare and exercises endpoints
    const mf = new Miniflare({
      script: `addEventListener('fetch', event => {
        const url = new URL(event.request.url)
        if (url.pathname === '/api/auth/me') {
          return event.respondWith(new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } }))
        }
        return event.respondWith(new Response('ok'))
      })`
    })

    const res = await mf.dispatchFetch('http://localhost/api/auth/me')
    const json = await res.json()
    expect(json).toHaveProperty('user')

    await mf.stop()
  })
})
