import type { Database } from 'sqlite3'
import { CustomError } from '~/utils/error'

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

export class RecipeChecksRepository {
  constructor(private db: Database) {}

  async fetchByRecipe(recipeId: number, userId: number): Promise<RecipeCheck[]> {
    try {
      // First verify the recipe belongs to the user
      const recipe = await this.db.get(
        `SELECT id FROM recipes WHERE id = ? AND user_id = ?`,
        [recipeId, userId]
      )
      if (!recipe) throw CustomError.notFound('Recipe not found')

      return await this.db.all<RecipeCheck[]>(
        `SELECT * FROM recipe_checks WHERE recipe_id = ? ORDER BY checked_at DESC`,
        [recipeId]
      )
    } catch (error) {
      if (error instanceof CustomError) throw error
      throw CustomError.databaseError('Failed to fetch recipe checks')
    }
  }

  async create(recipeId: number, userId: number): Promise<RecipeCheck> {
    try {
      // First verify the recipe belongs to the user
      const recipe = await this.db.get(
        `SELECT id FROM recipes WHERE id = ? AND user_id = ?`,
        [recipeId, userId]
      )
      if (!recipe) throw CustomError.notFound('Recipe not found')

      const result = await this.db.run(
        `INSERT INTO recipe_checks (recipe_id) VALUES (?)`,
        [recipeId]
      )

      const newCheck = await this.db.get<RecipeCheck>(
        `SELECT * FROM recipe_checks WHERE id = ?`,
        [result.lastID]
      )

      if (!newCheck) throw CustomError.databaseError('Failed to create recipe check')

      return newCheck
    } catch (error) {
      if (error instanceof CustomError) throw error
      throw CustomError.databaseError('Failed to create recipe check')
    }
  }

  async getStats(userId: number, period: 'month' | 'week' = 'month'): Promise<CheckStats> {
    try {
      const dateFilter = period === 'month'
        ? "date('now', '-1 month')"
        : "date('now', '-7 days')"

      const [totalResult, periodResult] = await Promise.all([
        this.db.get<{ count: number }>(
          `SELECT COUNT(*) as count FROM recipe_checks rc
           JOIN recipes r ON rc.recipe_id = r.id
           WHERE r.user_id = ?`,
          [userId]
        ),
        this.db.get<{ count: number }>(
          `SELECT COUNT(*) as count FROM recipe_checks rc
           JOIN recipes r ON rc.recipe_id = r.id
           WHERE r.user_id = ? AND rc.checked_at >= ${dateFilter}`,
          [userId]
        )
      ])

      return {
        totalChecks: totalResult?.count || 0,
        monthlyChecks: period === 'month' ? (periodResult?.count || 0) : 0,
        weeklyChecks: period === 'week' ? (periodResult?.count || 0) : 0
      }
    } catch (error) {
      throw CustomError.databaseError('Failed to get check statistics')
    }
  }
}
