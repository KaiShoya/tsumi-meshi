import { apiClient } from '~/utils/api/client'

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
  // Use Nuxt's `useState` to keep auth state shared across all callers
  const state = useState<AuthState>('auth-state', () => ({
    user: null,
    loading: false
  }))

  // Initialize auth state by asking server for current session
  const initAuth = async () => {
    state.value.loading = true
    try {
      // Use centralized apiClient (Cloudflare Workers) for auth calls.
      const res = await apiClient.getCurrentUser()
      state.value.user = (res as { user?: User | null })?.user ?? null
    } catch {
      // Not authenticated or error: clear local state
      state.value.user = null
    } finally {
      state.value.loading = false
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    state.value.loading = true
    try {
      const response = await apiClient.login(email, password)
      const user = (response as { user?: User })?.user
      state.value.user = (user ?? null) as User | null
      return state.value.user
    } finally {
      state.value.loading = false
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    state.value.loading = true
    try {
      const response = await apiClient.register(name, email, password)
      const user = (response as { user?: User })?.user
      state.value.user = (user ?? null) as User | null
      return state.value.user
    } catch (error) {
      state.value.user = null
      throw error // Re-throw so pages can handle errors
    } finally {
      state.value.loading = false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await apiClient.logout()
    } catch {
      // ignore errors on logout
    }
    clearAuth()
    // Intentionally return void to match event handler typing in templates
  }

  // Clear authentication data
  const clearAuth = () => {
    state.value.user = null
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!state.value.user)

  // Get current user ID (for API calls)
  const getCurrentUserId = () => {
    return state.value.user?.id || null
  }

  return {
    // State
    user: computed(() => state.value.user),
    loading: computed(() => state.value.loading),
    isAuthenticated,

    // Methods
    initAuth,
    login,
    register,
    logout,
    getCurrentUserId
  }
}
