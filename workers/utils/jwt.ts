export async function createJWT(header: Record<string, unknown>, payload: Record<string, unknown>, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header))
  const payloadB64 = btoa(JSON.stringify(payload))

  const message = `${headerB64}.${payloadB64}`
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

  return `${message}.${signatureB64}`
}
