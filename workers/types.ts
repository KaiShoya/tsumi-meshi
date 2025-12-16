export type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

export type UserPayload = {
  userId: number
  email?: string
  name?: string
  iat?: number
  exp?: number
}
