import { apiClient } from '~/utils/api/client'

export const useUpload = () => {
  const requestUpload = async (file: File) => {
    // Request upload info from centralized API (Cloudflare)
    const res = await apiClient.requestUpload(file.name, file.size, file.type)

    const payload = res as { ok?: boolean, url?: string, key?: string, data?: { message?: string } }
    if (!payload || payload.ok === false) {
      throw new Error(payload?.data?.message || 'Upload endpoint error')
    }

    if (payload.url) {
      try {
        const resp = await fetch(payload.url, { method: 'PUT', body: file })
        if (!resp.ok) {
          // try to get response body for more context
          let bodyText = ''
          try {
            bodyText = await resp.text()
          } catch {
            bodyText = ''
          }
          const msg = `Upload failed: ${resp.status} ${resp.statusText}${bodyText ? ` - ${bodyText}` : ''}`
          throw new Error(msg)
        }

        return payload.key || null
      } catch (err: unknown) {
        // log and rethrow with context so callers can handle it
        // include key/url to help debugging

        console.error('Upload error', { url: payload.url, key: payload.key, error: err })
        const message = err instanceof Error ? err.message : String(err)
        throw new Error(`Upload to ${payload.url} failed for key=${payload.key}: ${message}`)
      }
    }

    return payload.key || null
  }

  return { requestUpload }
}

export default useUpload
