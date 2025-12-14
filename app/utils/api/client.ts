import { useAuth } from '~/composables/useAuth'

class ApiClient {
  private baseURL: string

  constructor() {
    // In production, this should be your Cloudflare Workers URL
    this.baseURL = 'http://localhost:8787' // For local development
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { token } = useAuth()

    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: unknown, token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ user: unknown, token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    })
  }

  async getCurrentUser() {
    return this.request<{ user: unknown }>('/auth/me')
  }

  // Recipe endpoints
  async getRecipes() {
    return this.request<{ recipes: unknown[] }>('/recipes')
  }

  async createRecipe(recipe: {
    title: string
    url: string
    description?: string
    folderId?: number
  }) {
    return this.request<{ recipe: unknown }>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe)
    })
  }

  async updateRecipe(id: number, recipe: Partial<{
    title: string
    url: string
    description?: string
    folderId?: number
  }>) {
    return this.request<{ recipe: unknown }>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe)
    })
  }

  async deleteRecipe(id: number) {
    return this.request(`/recipes/${id}`, {
      method: 'DELETE'
    })
  }
}

export const apiClient = new ApiClient()
