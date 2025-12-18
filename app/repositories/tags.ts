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
