// Authentication is cookie-based; do not rely on client-side token

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
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
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
  async getRecipes(opts?: { q?: string, folderId?: number | null, tagIds?: number[] }) {
    const qs: string[] = []
    if (opts?.q) qs.push(`q=${encodeURIComponent(opts.q)}`)
    if (opts?.folderId) qs.push(`folderId=${opts.folderId}`)
    if (opts?.tagIds && opts.tagIds.length > 0) qs.push(`tagIds=${opts.tagIds.join(',')}`)
    const query = qs.length > 0 ? `?${qs.join('&')}` : ''
    return this.request<{ recipes: unknown[] }>(`/recipes${query}`)
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

  // Tag endpoints
  async getTags() {
    return this.request<{ tags: unknown[] }>('/tags')
  }

  // Folder endpoints
  async getFolders() {
    return this.request<{ folders: unknown[] }>('/folders')
  }

  async getFolderHierarchy() {
    return this.request<{ folders: unknown[] }>('/folders/hierarchy')
  }

  async createFolder(payload: { name: string, parentId?: number | null }) {
    return this.request<{ folder: unknown }>('/folders', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async updateFolder(id: number, payload: { name?: string, parentId?: number | null }) {
    return this.request<{ folder: unknown }>(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async deleteFolder(id: number) {
    return this.request(`/folders/${id}`, {
      method: 'DELETE'
    })
  }

  async createTag(name: string) {
    return this.request<{ tag: unknown }>('/tags', {
      method: 'POST',
      body: JSON.stringify({ name })
    })
  }

  async updateTag(id: number, name: string) {
    return this.request<{ tag: unknown }>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    })
  }

  async deleteTag(id: number) {
    return this.request(`/tags/${id}`, {
      method: 'DELETE',
      body: null
    })
  }

  async findOrCreateTag(name: string) {
    return this.request<{ tag: unknown }>('/tags/find-or-create', {
      method: 'POST',
      body: JSON.stringify({ name })
    })
  }

  // Check endpoints
  async getChecks(recipeId: number) {
    return this.request<{ checks: unknown[] }>(`/recipes/${recipeId}/checks`)
  }

  async createCheck(recipeId: number) {
    return this.request<{ check: unknown }>(`/recipes/${recipeId}/checks`, {
      method: 'POST'
    })
  }

  async getCheckStats(period: 'month' | 'week' = 'month') {
    return this.request<{ totalChecks: number, periodChecks: number }>(`/checks/stats?period=${period}`)
  }
}

export const apiClient = new ApiClient()
