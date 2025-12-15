export const useUpload = () => {
  const requestUpload = async (file: File) => {
    // Request upload info from server
    const res = await $fetch('/api/upload/image', {
      method: 'POST',
      body: { name: file.name, size: file.size, type: file.type }
    }) as unknown

    const payload = res as unknown as {
      ok?: boolean
      data?: { message?: string }
      url?: string
      key?: string
    }

    if (!payload || payload.ok === false) {
      throw new Error(payload?.data?.message || 'Upload endpoint error')
    }

    // If the endpoint returns a presigned URL (not implemented here), perform upload
    if (payload && typeof payload.url === 'string') {
      await fetch(payload.url, { method: 'PUT', body: file })
      return payload.key || null
    }

    // Otherwise return server note
    return null
  }

  return { requestUpload }
}

export default useUpload
