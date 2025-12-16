export interface StatsSummary {
  totalRecipes: number
  totalChecks: number
  activeTags: number
}

export interface ChecksOverTimeRow {
  date: string
  count: number
}

export interface TopTag {
  tag: string
  count: number
}

export interface RecentRecipe {
  id: string
  title: string
  createdAt: string
}

export interface StatsResponse {
  summary: StatsSummary
  checksOverTime: ChecksOverTimeRow[]
  topTags: TopTag[]
  recentRecipes: RecentRecipe[]
}

/**
 * Fetch stats from server API.
 * Uses Nuxt's `$fetch` which is preferred in tests and runtime.
 */
export async function fetchStats(range: '30d' | '90d' | '365d' = '30d'): Promise<StatsResponse> {
  return await $fetch<StatsResponse>(`/api/stats?range=${encodeURIComponent(range)}`)
}
