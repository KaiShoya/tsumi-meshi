const base64UrlEncodeFromString = (input: string) => {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const b64 = btoa(binary)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const base64UrlFromBytes = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const b64 = btoa(binary)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const createJWT = async (header: Record<string, unknown>, payload: Record<string, unknown>, secret: string): Promise<string> => {
  const headerB64 = base64UrlEncodeFromString(JSON.stringify(header))
  const payloadB64 = base64UrlEncodeFromString(JSON.stringify(payload))

  const message = `${headerB64}.${payloadB64}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const signatureB64 = base64UrlFromBytes(signature)

  return `${message}.${signatureB64}`
}
