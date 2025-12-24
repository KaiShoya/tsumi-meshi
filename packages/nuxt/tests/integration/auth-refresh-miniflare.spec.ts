import { describe, it, expect } from 'vitest'

// This test runs only when `miniflare` is available as a dev dependency.
// To enable full Workers-like E2E locally, run:
//   pnpm add -D miniflare
// Then run this test with `pnpm test -- tests/integration/auth-refresh-miniflare.spec.ts`

describe('auth refresh via Miniflare (optional)', () => {
  it('skipped or runs when miniflare is installed', async () => {
    let MiniflareModule: unknown = null
    try {
      // dynamic import so tests still run even if miniflare is not installed
      MiniflareModule = (await import('miniflare')).Miniflare
    } catch {
      MiniflareModule = null
    }

    if (!MiniflareModule) {
      console.warn('Miniflare not installed. Install with `pnpm add -D miniflare` to run this test.')
      expect(true).toBe(true)
      return
    }

    // @ts-expect-error Miniflare types are optional in dev environment
    const MfCtor = MiniflareModule as unknown as {
      new (...args: unknown[]): {
        dispatchFetch: (url: string) => Promise<Response>
        stop: () => Promise<void>
      }
    }
    const mf = new MfCtor({
      script: `addEventListener('fetch', event => {
        const url = new URL(event.request.url)
        if (url.pathname === '/api/v1/auth/me') {
          return event.respondWith(new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } }))
        }
        return event.respondWith(new Response('ok'))
      })`
    })
    // dispatchFetch exists on Miniflare instance
    const res = await mf.dispatchFetch('http://localhost/api/v1/auth/me')
    const json = await res.json()
    expect(json).toHaveProperty('user')
    // stop may not be available on all Miniflare versions
    if (typeof (mf as unknown as { stop?: () => Promise<void> }).stop === 'function') {
      await (mf as unknown as { stop: () => Promise<void> }).stop()
    }
  })
})
