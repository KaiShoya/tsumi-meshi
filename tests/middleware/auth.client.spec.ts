/* eslint-disable @stylistic/member-delimiter-style */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('auth.client middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects unauthenticated user to login with redirectTo', async () => {
    const initAuth = vi.fn().mockResolvedValue(undefined)
    const authStub = { initAuth, isAuthenticated: { value: false } }
    vi.stubGlobal('useAuth', () => authStub)

    const nav = vi.fn()
    vi.stubGlobal('navigateTo', nav)

    const mod = await import('~/middleware/auth.client')
    type ToRoute = { path: string, fullPath: string, query: Record<string, string> }
    const mw = mod.default as (to: ToRoute) => Promise<unknown>

    const to = { path: '/recipes', fullPath: '/recipes?page=2', query: {} }
    await mw(to)

    expect(initAuth).toHaveBeenCalled()
    expect(nav).toHaveBeenCalledWith('/auth/login?redirectTo=%2Frecipes%3Fpage%3D2')
  })

  it('redirects authenticated user away from auth pages to redirectTo or home', async () => {
    const initAuth = vi.fn().mockResolvedValue(undefined)
    const authStub = { initAuth, isAuthenticated: { value: true } }
    vi.stubGlobal('useAuth', () => authStub)

    const nav = vi.fn()
    vi.stubGlobal('navigateTo', nav)

    const mod = await import('~/middleware/auth.client')
    type ToRoute = { path: string, fullPath: string, query: Record<string, string> }
    const mw = mod.default as (to: ToRoute) => Promise<unknown>

    const to = { path: '/auth/login', fullPath: '/auth/login?redirectTo=%2Frecipes%2F1', query: { redirectTo: '/recipes/1' } }
    await mw(to)

    expect(initAuth).toHaveBeenCalled()
    expect(nav).toHaveBeenCalledWith('/recipes/1')
  })

  it('does not redirect unauthenticated user visiting auth pages', async () => {
    const initAuth = vi.fn().mockResolvedValue(undefined)
    const authStub = { initAuth, isAuthenticated: { value: false } }
    vi.stubGlobal('useAuth', () => authStub)

    const nav = vi.fn()
    vi.stubGlobal('navigateTo', nav)

    const mod = await import('~/middleware/auth.client')
    type ToRoute = { path: string, fullPath: string, query: Record<string, string> }
    const mw = mod.default as (to: ToRoute) => Promise<unknown>

    const to = { path: '/auth/login', fullPath: '/auth/login', query: {} }
    await mw(to)

    expect(initAuth).toHaveBeenCalled()
    expect(nav).not.toHaveBeenCalled()
  })
})
