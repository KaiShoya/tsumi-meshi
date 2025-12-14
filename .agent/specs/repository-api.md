# Repository API

## Overview
Repository pattern implementation for data access abstraction. All repositories handle Cloudflare D1 database operations.

## Repository Classes

### RecipesRepository
Handles recipe CRUD operations.

#### Methods
- `fetchAll(userId: number): Promise<Recipe[]>`
- `fetchById(id: number, userId: number): Promise<Recipe | null>`
- `create(recipe: RecipeInput, userId: number): Promise<Recipe>`
- `update(id: number, recipe: RecipeUpdate, userId: number): Promise<Recipe>`
- `delete(id: number, userId: number): Promise<void>`
- `search(query: string, userId: number): Promise<Recipe[]>`
- `filterByFolder(folderId: number, userId: number): Promise<Recipe[]>`
- `filterByTags(tagIds: number[], userId: number): Promise<Recipe[]>`

### FoldersRepository
Handles folder hierarchy operations.

#### Methods
- `fetchAll(userId: number): Promise<Folder[]>`
- `fetchById(id: number, userId: number): Promise<Folder | null>`
- `create(folder: FolderInput, userId: number): Promise<Folder>`
- `update(id: number, folder: FolderUpdate, userId: number): Promise<Folder>`
- `delete(id: number, userId: number): Promise<void>`
- `getHierarchy(userId: number): Promise<FolderTree[]>`

### TagsRepository
Handles tag management.

#### Methods
- `fetchAll(userId: number): Promise<Tag[]>`
- `fetchById(id: number, userId: number): Promise<Tag | null>`
- `create(tag: TagInput, userId: number): Promise<Tag>`
- `update(id: number, tag: TagUpdate, userId: number): Promise<Tag>`
- `delete(id: number, userId: number): Promise<void>`
- `findOrCreate(name: string, userId: number): Promise<Tag>`

### RecipeChecksRepository
Handles check history.

#### Methods
- `fetchByRecipe(recipeId: number, userId: number): Promise<RecipeCheck[]>`
- `create(recipeId: number, userId: number): Promise<RecipeCheck>`
- `getStats(userId: number, period: 'month' | 'week'): Promise<CheckStats>`

### UsersRepository
Handles user operations.

#### Methods
- `findByEmail(email: string): Promise<User | null>`
- `create(user: UserInput): Promise<User>`
- `update(id: number, user: UserUpdate): Promise<User>`

## Error Handling Strategy
All repository methods throw `CustomError` instances with appropriate error codes:
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `DATABASE_ERROR`: Database operation failed
- `PERMISSION_DENIED`: Access denied

## Data Types
```typescript
interface Recipe {
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

interface Folder {
  id: number
  userId: number
  name: string
  parentId?: number
  children?: Folder[]
  createdAt: Date
  updatedAt: Date
}

interface Tag {
  id: number
  userId: number
  name: string
  createdAt: Date
}

interface RecipeCheck {
  id: number
  recipeId: number
  checkedAt: Date
}

interface User {
  id: number
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}
```

## API Integration
Repositories communicate with Cloudflare Workers API endpoints for data operations.
