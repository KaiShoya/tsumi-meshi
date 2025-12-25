import type { Tag } from './tags'
import type { RecipeCheck } from './recipe-checks'

export interface Recipe {
  id: number
  userId: number
  folderId?: number
  title: string
  url: string
  description?: string
  imageUrl?: string
  ingredients?: string[]
  instructions?: Array<string | { text: string }>
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
