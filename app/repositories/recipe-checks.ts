export interface RecipeCheck {
  id: number
  recipeId: number
  checkedAt: Date
}

export interface CheckStats {
  totalChecks: number
  monthlyChecks: number
  weeklyChecks: number
}
// Server-side repository implementations have been moved to `workers/routes`.
// Keep type definitions here for frontend imports.

