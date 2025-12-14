import type { D1Database } from '@cloudflare/workers-types'
import { CustomError } from '~/utils/error'

export interface Folder {
  id: number
  userId: number
  name: string
  parentId?: number
  children?: Folder[]
  createdAt: Date
  updatedAt: Date
}

export interface FolderInput {
  name: string
  parentId?: number
}

export interface FolderUpdate {
  name?: string
  parentId?: number
}

export interface FolderTree extends Folder {
  children: FolderTree[]
}

export class FoldersRepository {
  constructor(private db: any) {}

  async fetchAll(userId: number): Promise<Folder[]> {
    try {
      return await this.db.all(
        `SELECT * FROM folders WHERE user_id = ? ORDER BY name`,
        [userId]
      )
    } catch {
      throw CustomError.databaseError('Failed to fetch folders')
    }
  }

  async fetchById(id: number, userId: number): Promise<Folder | null> {
    try {
      return await this.db.get(
        `SELECT * FROM folders WHERE id = ? AND user_id = ?`,
        [id, userId]
      )
    } catch {
      throw CustomError.databaseError('Failed to fetch folder')
    }
  }

  async create(folder: FolderInput, userId: number): Promise<Folder> {
    try {
      const result = await this.db.run(
        `INSERT INTO folders (user_id, name, parent_id) VALUES (?, ?, ?)`,
        [userId, folder.name, folder.parentId]
      )

      const newFolder = await this.fetchById(result.lastID!, userId)
      if (!newFolder) throw CustomError.databaseError('Failed to create folder')

      return newFolder
    } catch {
      throw CustomError.databaseError('Failed to create folder')
    }
  }

  async update(id: number, folder: FolderUpdate, userId: number): Promise<Folder> {
    try {
      const result = await this.db.run(
        `UPDATE folders SET
         name = COALESCE(?, name),
         parent_id = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [folder.name, folder.parentId, id, userId]
      )

      if (result.changes === 0) throw CustomError.notFound('Folder not found')

      const updatedFolder = await this.fetchById(id, userId)
      if (!updatedFolder) throw CustomError.databaseError('Failed to update folder')

      return updatedFolder
    } catch (error) {
      if (error instanceof CustomError) throw error
      throw CustomError.databaseError('Failed to update folder')
    }
  }

  async delete(id: number, userId: number): Promise<void> {
    try {
      const result = await this.db.run(
        `DELETE FROM folders WHERE id = ? AND user_id = ?`,
        [id, userId]
      )

      if (result.changes === 0) throw CustomError.notFound('Folder not found')
    } catch (error) {
      if (error instanceof CustomError) throw error
      throw CustomError.databaseError('Failed to delete folder')
    }
  }

  async getHierarchy(userId: number): Promise<FolderTree[]> {
    try {
      const folders = await this.fetchAll(userId)
      return this.buildHierarchy(folders)
    } catch {
      throw CustomError.databaseError('Failed to get folder hierarchy')
    }
  }

  private buildHierarchy(folders: Folder[]): FolderTree[] {
    const folderMap = new Map<number, FolderTree>()
    const roots: FolderTree[] = []

    // Create folder map
    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // Build hierarchy
    folders.forEach((folder) => {
      const folderTree = folderMap.get(folder.id)!
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId)
        if (parent) {
          parent.children.push(folderTree)
        }
      } else {
        roots.push(folderTree)
      }
    })

    return roots
  }
}
