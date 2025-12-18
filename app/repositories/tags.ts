export interface Tag {
  id: number
  userId: number
  name: string
  createdAt: Date
}

export interface TagInput {
  name: string
}

export interface TagUpdate {
  name?: string
}
// Server-side repository implementations have been moved to `workers/routes`.
// Keep type definitions here for frontend imports.

