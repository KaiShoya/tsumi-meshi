import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '~/composables/useAuth'

describe('auth refresh integration (simulated)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rehydrates session via /api/auth/me after login (simulated cookie)', async () => {
    const fakeUser = { id: 42, name: 'RefreshUser', email: 'r@example.com' }

    // Simulate server-side cookie state
    let cookiePresent = false

    const fetchStub = vi.fn(async (path: string, _opts?: unknown) => {
      // Accept either full base URL or bare path; match on suffix
      if (String(path).endsWith('/auth/me')) {
        return { user: cookiePresent ? fakeUser : null }
      }
      if (String(path).endsWith('/auth/login')) {
        // login sets cookie on the server; simulate by flipping flag
        cookiePresent = true
        return { user: fakeUser }
      }
      if (String(path).endsWith('/auth/logout')) {
        cookiePresent = false
        return {}
      }
      return {}
    })

    vi.stubGlobal('$fetch', fetchStub)
    // stub navigateTo to avoid runtime navigation effects
    vi.stubGlobal('navigateTo', vi.fn())

    // Instance A: initial check - not authenticated
    const authA = useAuth()
    await authA.initAuth()
    expect(authA.isAuthenticated.value).toBe(false)

    // Perform login on instance A
    await authA.login('r@example.com', 'pw')
    expect(authA.isAuthenticated.value).toBe(true)
    expect(authA.user.value).toEqual(fakeUser)

    // Simulate app reload: new composable instance should pick up cookie via /api/auth/me
    const authB = useAuth()
    await authB.initAuth()
    expect(authB.isAuthenticated.value).toBe(true)
    expect(authB.user.value).toEqual(fakeUser)

    // Cleanup global stubs
    vi.unstubAllGlobals()
  })
})
