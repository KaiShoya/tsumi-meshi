export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export class CustomError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number

  constructor(code: ErrorCode, message: string, statusCode: number = 500) {
    super(message)
    this.name = 'CustomError'
    this.code = code
    this.statusCode = statusCode
  }

  static notFound(message: string = 'Resource not found'): CustomError {
    return new CustomError(ErrorCode.NOT_FOUND, message, 404)
  }

  static validationError(message: string = 'Validation failed'): CustomError {
    return new CustomError(ErrorCode.VALIDATION_ERROR, message, 400)
  }

  static databaseError(message: string = 'Database operation failed'): CustomError {
    return new CustomError(ErrorCode.DATABASE_ERROR, message, 500)
  }

  static permissionDenied(message: string = 'Permission denied'): CustomError {
    return new CustomError(ErrorCode.PERMISSION_DENIED, message, 403)
  }

  static unauthorized(message: string = 'Unauthorized'): CustomError {
    return new CustomError(ErrorCode.UNAUTHORIZED, message, 401)
  }

  getMessage(): string {
    return this.message
  }
}
