import type { Database } from 'sqlite3'
import { CustomError } from '~/utils/error'

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

export class TagsRepository {
  constructor(private db: Database) {}

  async fetchAll(userId: number): Promise<Tag[]> {
    try {
      return await this.db.all<Tag[]>(
        `SELECT * FROM tags WHERE user_id = ? ORDER BY name`,
        [userId]
      )
    } catch {
      throw CustomError.databaseError('Failed to fetch tags')
    }
  }

  async fetchById(id: number, userId: number): Promise<Tag | null> {
    try {
      return await this.db.get<Tag>(
        `SELECT * FROM tags WHERE id = ? AND user_id = ?`,
        [id, userId]
      )
    } catch {
      throw CustomError.databaseError('Failed to fetch tag')
    }
  }

  async create(tag: TagInput, userId: number): Promise<Tag> {
    try {
      const result = await this.db.run(
        `INSERT INTO tags (user_id, name) VALUES (?, ?)`,
        [userId, tag.name]
      )

      const newTag = await this.fetchById(result.lastID!, userId)
      if (!newTag) throw CustomError.databaseError('Failed to create tag')

      return newTag
    } catch {
      throw CustomError.databaseError('Failed to create tag')
    }
  }

  async update(id: number, tag: TagUpdate, userId: number): Promise<Tag> {
    try {
      const result = await this.db.run(
        `UPDATE tags SET name = COALESCE(?, name) WHERE id = ? AND user_id = ?`,
        [tag.name, id, userId]
      )

      if (result.changes === 0) throw CustomError.notFound('Tag not found')

      const updatedTag = await this.fetchById(id, userId)
      if (!updatedTag) throw CustomError.databaseError('Failed to update tag')

      return updatedTag
    } catch {
      if (error instanceof CustomError) throw error
      throw CustomError.databaseError('Failed to update tag')
    }
  }

  async delete(id: number, userId: number): Promise<void> {
    try {
      const result = await this.db.run(
        `DELETE FROM tags WHERE id = ? AND user_id = ?`,
        [id, userId]
      )

      if (result.changes === 0) throw CustomError.notFound('Tag not found')
    } catch {
      if (error instanceof CustomError) throw error
      throw CustomError.databaseError('Failed to delete tag')
    }
  }

  async findOrCreate(name: string, userId: number): Promise<Tag> {
    try {
      // Try to find existing tag
      const tag = await this.db.get<Tag>(
        `SELECT * FROM tags WHERE user_id = ? AND name = ?`,
        [userId, name]
      )

      if (tag) return tag

      // Create new tag
      return await this.create({ name }, userId)
    } catch {
      throw CustomError.databaseError('Failed to find or create tag')
    }
  }
}
