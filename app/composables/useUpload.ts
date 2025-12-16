export const useUpload = () => {
  const requestUpload = async (file: File) => {
    // Request upload info from centralized API (Cloudflare)
    const { apiClient } = await import('~/utils/api/client')
    const res = await apiClient.requestUpload(file.name, file.size, file.type)

    const payload = res as { ok?: boolean, url?: string, key?: string, data?: { message?: string } }
    if (!payload || payload.ok === false) {
      throw new Error(payload?.data?.message || 'Upload endpoint error')
    }

    if (payload.url) {
      await fetch(payload.url, { method: 'PUT', body: file })
      return payload.key || null
    }

    return payload.key || null
  }

  return { requestUpload }
}

export default useUpload
