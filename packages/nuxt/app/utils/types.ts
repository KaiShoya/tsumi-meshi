// Minimal interface to type the D1-like database used in repositories
export type D1Like = {
  all: <T = unknown>(...args: unknown[]) => Promise<T>
  get: <T = unknown>(...args: unknown[]) => Promise<T | null>
  run: (...args: unknown[]) => Promise<{ changes?: number, lastID?: number }>
}
