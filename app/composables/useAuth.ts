export interface User {
  id: number
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

export const useAuth = () => {
  const state = reactive<AuthState>({
    user: null,
    token: null,
    loading: false
  })

  // Initialize auth state from localStorage
  const initAuth = () => {
    if (import.meta.client) {
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('auth_user')

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          state.token = token
          state.user = user
        } catch {
          // Invalid stored data, clear it
          clearAuth()
        }
      }
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    state.loading = true
    try {
      // TODO: Implement API call to Cloudflare Workers
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      const { user, token } = response

      state.user = user
      state.token = token

      // Store in localStorage
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }

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
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { name, email, password }
      })

      const { user, token } = response

      state.user = user
      state.token = token

      // Store in localStorage
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }

      // Redirect to home
      await navigateTo('/')
    } finally {
      state.loading = false
    }
  }

  // Logout function
  const logout = () => {
    clearAuth()
    navigateTo('/auth/login')
  }

  // Clear authentication data
  const clearAuth = () => {
    state.user = null
    state.token = null

    if (import.meta.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!state.user && !!state.token)

  // Get current user ID (for API calls)
  const getCurrentUserId = () => {
    return state.user?.id || null
  }

  return {
    // State
    user: readonly(state).user,
    token: readonly(state).token,
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
