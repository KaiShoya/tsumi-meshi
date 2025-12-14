import { CustomError } from '~/utils/error'
import type { D1Like } from '~/utils/types'

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

export class UsersRepository {
  constructor(private db: D1Like) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.db.get<User | null>(
        `SELECT * FROM users WHERE email = ?`,
        [email]
      )
    } catch {
      throw CustomError.databaseError('Failed to find user by email')
    }
  }

  async create(user: UserInput): Promise<User> {
    try {
      const result = await this.db.run(
        `INSERT INTO users (email, name) VALUES (?, ?)`,
        [user.email, user.name]
      )

      const newUser = await this.db.get<User | null>(
        `SELECT * FROM users WHERE id = ?`,
        [result.lastID]
      )

      if (!newUser) throw CustomError.databaseError('Failed to create user')

      return newUser
    } catch {
      throw CustomError.databaseError('Failed to create user')
    }
  }

  async update(id: number, user: UserUpdate): Promise<User> {
    try {
      const result = await this.db.run(
        `UPDATE users SET
         name = COALESCE(?, name),
         email = COALESCE(?, email),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [user.name, user.email, id]
      )

      if (result.changes === 0) throw CustomError.notFound('User not found')

      const updatedUser = await this.db.get<User | null>(
        `SELECT * FROM users WHERE id = ?`,
        [id]
      )

      if (!updatedUser) throw CustomError.databaseError('Failed to update user')

      return updatedUser
    } catch (error) {
      if (error instanceof CustomError) throw error
      throw CustomError.databaseError('Failed to update user')
    }
  }
}
