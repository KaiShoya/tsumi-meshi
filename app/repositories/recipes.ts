export interface Recipe {
  id: number
  userId: number
  folderId?: number
  title: string
  url: string
  description?: string
  imageUrl?: string
  tags: readonly Tag[]
  checks: readonly RecipeCheck[]
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
// Server-side repository implementations have been moved to `workers/routes`.
// Keep type definitions here so frontend code can import repository types.

export { Tag } from './tags'
export { RecipeCheck } from './recipe-checks'
