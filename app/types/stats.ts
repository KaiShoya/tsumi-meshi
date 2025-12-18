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
  id: number
  title: string
  createdAt: string
}

export interface StatsResponse {
  summary: StatsSummary
  checksOverTime: ChecksOverTimeRow[]
  topTags: TopTag[]
  recentRecipes: RecentRecipe[]
}
