export const LOCALES = ['ja', 'en'] as const
export type Locale = typeof LOCALES[number]

export const DEFAULT_LOCALE: Locale = 'ja'

export const LOCALE_KEYS = {
  APP_TITLE: 'app.title',
  FOLDERS_TITLE: 'folders.title',
  FOLDERS_CREATE: 'folders.create'
} as const
