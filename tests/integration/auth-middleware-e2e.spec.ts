/* eslint-disable @stylistic/member-delimiter-style */
import { describe, it, expect, beforeEach } from 'vitest'

// Import the middleware handler (defineNuxtRouteMiddleware is stubbed in tests/setup.ts)
import middleware from '../../app/middleware/auth.client'

describe('E2E: auth client middleware navigation flow', () => {
  let capturedNavigate: string | undefined

  interface TestGlobals {
    navigateTo?: (path: string) => unknown,
    useAuth?: () => { isAuthenticated: { value: boolean }; initAuth: () => Promise<void> },
  }

  beforeEach(() => {
    // reset global navigateTo and useAuth mocks
    capturedNavigate = undefined
    ;(globalThis as unknown as TestGlobals).navigateTo = (path: string) => {
      capturedNavigate = path
      return path
    }
  })

  it('redirects unauthenticated user from protected page to login with redirectTo', async () => {
    const auth = {
      isAuthenticated: { value: false },
      initAuth: async () => {}
    }
    ;(globalThis as unknown as TestGlobals).useAuth = () => auth

    const to = { path: '/dashboard', fullPath: '/dashboard', query: {} }
    const res = await (middleware as unknown as (to: { path: string; fullPath: string; query: Record<string, string> }) => Promise<unknown>)(to)

    expect(capturedNavigate).toBe('/auth/login?redirectTo=%2Fdashboard')
    expect(res).toBe('/auth/login?redirectTo=%2Fdashboard')
  })

  it('redirects authenticated user away from /auth to redirectTo or /', async () => {
    const auth = {
      isAuthenticated: { value: true },
      initAuth: async () => {}
    }
    ;(globalThis as unknown as TestGlobals).useAuth = () => auth

    const to = { path: '/auth/login', fullPath: '/auth/login', query: { redirectTo: '/dashboard' } }
    const res = await (middleware as unknown as (to: { path: string; fullPath: string; query: Record<string, string> }) => Promise<unknown>)(to)

    expect(capturedNavigate).toBe('/dashboard')
    expect(res).toBe('/dashboard')
  })
})
