export interface User {
  id: number
  email: string
  name: string
}

export interface AuthResponse {
  user: User
  token?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}

export const useAuth = () => {
  const state = reactive<AuthState>({
    user: null,
    loading: false
  })

  // Initialize auth state by asking server for current session
  const initAuth = async () => {
    state.loading = true
    try {
      const res = await $fetch<{ user: User | null }>('/api/auth/me')
      state.user = res?.user ?? null
    } catch {
      // Not authenticated or error: clear local state
      state.user = null
    } finally {
      state.loading = false
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    state.loading = true
    try {
      // TODO: Implement API call to Cloudflare Workers
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      const { user } = response

      // Server sets auth cookie (HttpOnly); client stores only user in memory
      state.user = user

      // Redirect to home
      await navigateTo('/')
    } finally {
      state.loading = false
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    state.loading = true
    try {
      // TODO: Implement API call to Cloudflare Workers
      const response = await $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password }
      })

      const { user } = response

      state.user = user

      // Redirect to home
      await navigateTo('/')
    } finally {
      state.loading = false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore errors on logout
    }
    clearAuth()
    await navigateTo('/auth/login')
  }

  // Clear authentication data
  const clearAuth = () => {
    state.user = null
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!state.user)

  // Get current user ID (for API calls)
  const getCurrentUserId = () => {
    return state.user?.id || null
  }

  return {
    // State
    user: computed(() => state.user),
    loading: readonly(state).loading,
    isAuthenticated,

    // Methods
    initAuth,
    login,
    register,
    logout,
    getCurrentUserId
  }
}
