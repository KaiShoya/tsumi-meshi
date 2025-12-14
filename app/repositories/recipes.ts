import type { Database } from 'sqlite3'
import { CustomError } from '~/utils/error'

export interface Recipe {
  id: number
  userId: number
  folderId?: number
  title: string
  url: string
  description?: string
  imageUrl?: string
  tags: Tag[]
  checks: RecipeCheck[]
  createdAt: Date
  updatedAt: Date
}

export interface RecipeInput {
  folderId?: number
  title: string
  url: string
  description?: string
  imageUrl?: string
}

export interface RecipeUpdate {
  folderId?: number
  title?: string
  url?: string
  description?: string
  imageUrl?: string
}

export interface Tag {
  id: number
  userId: number
  name: string
  createdAt: Date
}

export interface RecipeCheck {
  id: number
  recipeId: number
  checkedAt: Date
}

export class RecipesRepository {
  constructor(private db: Database) {}

  async fetchAll(userId: number): Promise<Recipe[]> {
    try {
      const recipes = await this.db.all<Recipe[]>(
        `SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      )

      // Load tags and checks for each recipe
      const recipesWithDetails = await Promise.all(
        recipes.map(recipe => this.loadRecipeDetails(recipe))
      )

      return recipesWithDetails
    } catch (error) {
      throw CustomError.databaseError('Failed to fetch recipes')
    }
  }

  async fetchById(id: number, userId: number): Promise<Recipe | null> {
    try {
      const recipe = await this.db.get<Recipe>(
        `SELECT * FROM recipes WHERE id = ? AND user_id = ?`,
        [id, userId]
      )

      if (!recipe) return null

      return await this.loadRecipeDetails(recipe)
    } catch (error) {
      throw CustomError.databaseError('Failed to fetch recipe')
    }
  }

  async create(recipe: RecipeInput, userId: number): Promise<Recipe> {
    try {
      const result = await this.db.run(
        `INSERT INTO recipes (user_id, folder_id, title, url, description, image_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, recipe.folderId, recipe.title, recipe.url, recipe.description, recipe.imageUrl]
      )

      const newRecipe = await this.fetchById(result.lastID!, userId)
      if (!newRecipe) throw CustomError.databaseError('Failed to create recipe')

      return newRecipe
    } catch (error) {
      throw CustomError.databaseError('Failed to create recipe')
    }
  }

  async update(id: number, recipe: RecipeUpdate, userId: number): Promise<Recipe> {
    try {
      const result = await this.db.run(
        `UPDATE recipes SET
         folder_id = COALESCE(?, folder_id),
         title = COALESCE(?, title),
         url = COALESCE(?, url),
         description = COALESCE(?, description),
         image_url = COALESCE(?, image_url),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [recipe.folderId, recipe.title, recipe.url, recipe.description, recipe.imageUrl, id, userId]
      )

      if (result.changes === 0) throw CustomError.notFound('Recipe not found')

      const updatedRecipe = await this.fetchById(id, userId)
      if (!updatedRecipe) throw CustomError.databaseError('Failed to update recipe')

      return updatedRecipe
    } catch (error) {
      if (error instanceof CustomError) throw error
      throw CustomError.databaseError('Failed to update recipe')
    }
  }

  async delete(id: number, userId: number): Promise<void> {
    try {
      const result = await this.db.run(
        `DELETE FROM recipes WHERE id = ? AND user_id = ?`,
        [id, userId]
      )

      if (result.changes === 0) throw CustomError.notFound('Recipe not found')
    } catch (error) {
      if (error instanceof CustomError) throw error
      throw CustomError.databaseError('Failed to delete recipe')
    }
  }

  async search(query: string, userId: number): Promise<Recipe[]> {
    try {
      const recipes = await this.db.all<Recipe[]>(
        `SELECT * FROM recipes WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)
         ORDER BY created_at DESC`,
        [userId, `%${query}%`, `%${query}%`]
      )

      return await Promise.all(recipes.map(recipe => this.loadRecipeDetails(recipe)))
    } catch (error) {
      throw CustomError.databaseError('Failed to search recipes')
    }
  }

  async filterByFolder(folderId: number, userId: number): Promise<Recipe[]> {
    try {
      const recipes = await this.db.all<Recipe[]>(
        `SELECT * FROM recipes WHERE user_id = ? AND folder_id = ? ORDER BY created_at DESC`,
        [userId, folderId]
      )

      return await Promise.all(recipes.map(recipe => this.loadRecipeDetails(recipe)))
    } catch (error) {
      throw CustomError.databaseError('Failed to filter recipes by folder')
    }
  }

  async filterByTags(tagIds: number[], userId: number): Promise<Recipe[]> {
    try {
      const placeholders = tagIds.map(() => '?').join(',')
      const recipes = await this.db.all<Recipe[]>(
        `SELECT DISTINCT r.* FROM recipes r
         JOIN recipe_tags rt ON r.id = rt.recipe_id
         WHERE r.user_id = ? AND rt.tag_id IN (${placeholders})
         ORDER BY r.created_at DESC`,
        [userId, ...tagIds]
      )

      return await Promise.all(recipes.map(recipe => this.loadRecipeDetails(recipe)))
    } catch (error) {
      throw CustomError.databaseError('Failed to filter recipes by tags')
    }
  }

  private async loadRecipeDetails(recipe: Recipe): Promise<Recipe> {
    const [tags, checks] = await Promise.all([
      this.loadRecipeTags(recipe.id),
      this.loadRecipeChecks(recipe.id)
    ])

    return {
      ...recipe,
      tags,
      checks
    }
  }

  private async loadRecipeTags(recipeId: number): Promise<Tag[]> {
    return await this.db.all<Tag[]>(
      `SELECT t.* FROM tags t
       JOIN recipe_tags rt ON t.id = rt.tag_id
       WHERE rt.recipe_id = ?`,
      [recipeId]
    )
  }

  private async loadRecipeChecks(recipeId: number): Promise<RecipeCheck[]> {
    return await this.db.all<RecipeCheck[]>(
      `SELECT * FROM recipe_checks WHERE recipe_id = ? ORDER BY checked_at DESC`,
      [recipeId]
    )
  }
}
