import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuth } from '~/composables/useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initAuth sets user when session exists', async () => {
    const mockUser = { id: 1, email: 'a@b.com', name: 'Alice' }
    const fetchMock = vi.fn().mockResolvedValue({ user: mockUser })
    vi.stubGlobal('$fetch', fetchMock)

    const auth = useAuth()
    await auth.initAuth()

    expect(auth.isAuthenticated.value).toBe(true)
    expect(auth.user.value).toEqual(mockUser)
  })

  it('login calls API and sets user and navigates', async () => {
    const mockUser = { id: 2, email: 'b@c.com', name: 'Bob' }
    const fetchMock = vi.fn().mockResolvedValue({ user: mockUser })
    vi.stubGlobal('$fetch', fetchMock)
    const nav = vi.fn()
    vi.stubGlobal('navigateTo', nav)

    const auth = useAuth()
    await auth.login('b@c.com', 'password')

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), expect.any(Object))
    expect(auth.user.value).toEqual(mockUser)
    expect(nav).toHaveBeenCalledWith('/')
  })

  it('logout calls API and clears user and navigates to login', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ user: { id: 9, email: 'x@y.com', name: 'X' } }) // initAuth
      .mockResolvedValueOnce({}) // logout
    vi.stubGlobal('$fetch', fetchMock)
    const nav = vi.fn()
    vi.stubGlobal('navigateTo', nav)

    const auth = useAuth()
    await auth.initAuth()

    await auth.logout()

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/auth/logout'), { method: 'POST' })
    expect(auth.isAuthenticated.value).toBe(false)
    expect(nav).toHaveBeenCalledWith('/auth/login')
  })
})
