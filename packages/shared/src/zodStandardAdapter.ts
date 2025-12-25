import type { ZodTypeAny } from 'zod'

export const toStandard = (schema: ZodTypeAny) => {
  return {
    '~standard': {
      validate(input: unknown) {
        const res = schema.safeParse(input)
        if (!res.success) {
          return {
            issues: res.error.errors.map(e => ({ path: e.path, message: e.message }))
          }
        }
        return { value: res.data }
      }
    }
  }
}

export default toStandard
