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
