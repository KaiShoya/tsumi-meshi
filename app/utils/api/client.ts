// Authentication is cookie-based; do not rely on client-side token

class ApiClient {
  private baseURL: string

  constructor() {
    // Prefer an external API (Cloudflare Workers). Use the global override or
    // `NUXT_PUBLIC_API_BASE` if provided; otherwise default to localhost wrangler.
    const globalAny = globalThis as unknown as { __TSUMI_MESHI_API_BASE?: string }
    const env = import.meta as unknown as { env?: Record<string, string> }
    const envBase = env?.env?.NUXT_PUBLIC_API_BASE
    // Default to wrangler dev host with API base path so local dev hits Workers v1
    const defaultBase = 'http://localhost:8787/api/v1'
    const base = (globalAny.__TSUMI_MESHI_API_BASE || envBase || defaultBase).replace(/\/$/, '')

    // Avoid referencing `process` (not present in browser types) — prefer import.meta.env or global `VITEST` flag.
    // Use provided global override or `NUXT_PUBLIC_API_BASE` (from .env) otherwise default to wrangler dev host.
    // Keep base as configured for both test and runtime so requests target the Workers host
    // Tests that stub `fetch`/`$fetch` should intercept requests to the configured base.

    this.baseURL = base
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Determine effective base at request time so tests can stub global `$fetch`
    const base = this.baseURL
    const url = `${base}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    try {
      const g = globalThis as unknown as { $fetch?: unknown, fetch?: unknown }
      const has$fetch = typeof g.$fetch === 'function'

      if (has$fetch) {
        // Nuxt's $fetch returns parsed JSON (and throws on non-2xx),
        // and tests stub $fetch. Keep options minimal for calls without body
        // so tests that assert exact args (e.g. logout) continue to pass.
        const $fetch = g.$fetch as unknown as (u: string, o?: Record<string, unknown>) => Promise<unknown>
        const optsFor$fetch: Record<string, unknown> = options.body == null
          ? { method: options.method ?? 'GET', credentials: 'include' }
          : ({ ...options, credentials: 'include' } as Record<string, unknown>)

        const parsed = await $fetch(url, optsFor$fetch)
        return parsed as unknown as T
      }
      const fetchImpl = (g.fetch as unknown as typeof fetch) ?? fetch
      const response = await fetchImpl(url, {
        ...options,
        headers,
        // Ensure cookies are sent for cookie-based auth (cross-origin dev server)
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // Use logger for consistent logging; keep throwing so callers can handle
      try {
        const mod = await import('~/composables/useLogger') as unknown
        const logger = (mod as { useLogger?: () => { error?: (message: string, context: Record<string, unknown>, error?: Error) => void } }).useLogger?.()
        // call the returned logger if available
        try {
          logger?.error?.('API request failed', { endpoint }, error instanceof Error ? error : new Error(String(error)))
        } catch {
          // fallback to console if logger invocation fails
          console.error(`API request failed: ${endpoint}`, error)
        }
      } catch {
        console.error(`API request failed: ${endpoint}`, error)
      }
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

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    })
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

  async getRecipe(id: number) {
    return this.request<{ recipe: unknown }>(`/recipes/${id}`)
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

  // Dashboard / stats
  async getDashboardStats(range = '30d') {
    return this.request<{
      summary: { totalRecipes: number, totalChecks: number, activeTags: number }
      checksOverTime: Array<{ date: string, count: number }>
      topTags: Array<{ tag: string, count: number }>
      recentRecipes: Array<{ id: number, title: string, createdAt: string }>
    }>(`/stats?range=${encodeURIComponent(range)}`)
  }

  // Upload helper (presign or server-side handling)
  async requestUpload(name: string, size: number, type: string) {
    return this.request<{ ok?: boolean, url?: string, key?: string, data?: unknown }>('/upload/image', {
      method: 'POST',
      body: JSON.stringify({ name, size, type })
    })
  }
}

export const apiClient = new ApiClient()
