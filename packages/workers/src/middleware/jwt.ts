import type { Context } from 'hono'

const base64UrlToUint8Array = (b64url: string) => {
  const padded = b64url + '=='.slice((2 - b64url.length * 3) & 3)
  const b64 = padded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(b64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

const base64UrlToString = (b64url: string) => {
  const bytes = base64UrlToUint8Array(b64url)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  try {
    // decode UTF-8
    return decodeURIComponent(escape(s))
  } catch {
    return s
  }
}

// Custom JWT middleware: accept token from Authorization header or cookie `tsumi_session`.
export const createJwtMiddleware = () => {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const authHeader = c.req.header('Authorization') || ''
      const cookieHeader = c.req.header('cookie') || ''
      console.log('[jwt middleware] cookie header:', cookieHeader)

      let token: string | null = null
      if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7)
      else {
        const m = cookieHeader.match(/(?:^|; )tsumi_session=([^;]+)/)
        if (m && m[1]) token = decodeURIComponent(m[1])
      }

      if (!token) {
        console.log('[jwt middleware] no token found')
        return c.text('', 401)
      }

      const parts = token.split('.')
      if (parts.length !== 3) {
        console.log('[jwt middleware] token malformed')
        return c.text('', 401)
      }

      const [headerB64, payloadB64, sigB64] = parts
      const message = `${headerB64}.${payloadB64}`

      const keyData = new TextEncoder().encode(c.env.JWT_SECRET as string)
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
      const signature = base64UrlToUint8Array(sigB64)
      const ok = await crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(message))
      if (!ok) {
        console.log('[jwt middleware] signature verification failed')
        return c.text('', 401)
      }

      const payloadJson = base64UrlToString(payloadB64)
      let payload
      try {
        payload = JSON.parse(payloadJson)
      } catch (err) {
        console.log('[jwt middleware] payload parse error', err)
        return c.text('', 401)
      }

      c.set('jwtPayload', payload)
      console.log('[jwt middleware] jwtPayload set')
      await next()
    } catch (err) {
      console.error('[jwt middleware] unexpected error', err)
      return c.text('', 401)
    }
  }
}
