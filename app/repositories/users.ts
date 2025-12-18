export interface User {
  id: number
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface UserInput {
  email: string
  name: string
}

export interface UserUpdate {
  name?: string
  email?: string
}
// Server-side repository implementations have been moved to `workers/routes`.
// Keep type definitions here for frontend imports.

