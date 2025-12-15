export default defineEventHandler(async (event) => {
  // Read request body
  const body = await readBody(event)
  const { name, size, type } = (body ?? {}) as { name?: string, size?: number, type?: string }

  if (!name || typeof size !== 'number') {
    return createError({ statusCode: 400, statusMessage: 'BAD_REQUEST', data: { message: 'Missing name or size' } })
  }

  // Runtime config keys
  type R2RuntimeConfig = { R2_BUCKET?: string, CLOUDFLARE_ACCOUNT_ID?: string, R2_ACCESS_KEY_ID?: string, R2_SECRET_ACCESS_KEY?: string }
  const cfg = useRuntimeConfig() as unknown as R2RuntimeConfig
  const bucket = cfg.R2_BUCKET
  const account = cfg.CLOUDFLARE_ACCOUNT_ID
  const accessKey = cfg.R2_ACCESS_KEY_ID
  const secretKey = cfg.R2_SECRET_ACCESS_KEY

  if (!bucket || !account || !accessKey || !secretKey) {
    return createError({ statusCode: 501, statusMessage: 'R2_NOT_CONFIGURED', data: { message: 'Cloudflare R2 credentials not configured (R2_BUCKET, CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY required)' } })
  }

  // Validate size and type
  const MAX = 5 * 1024 * 1024
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (size > MAX) return createError({ statusCode: 413, statusMessage: 'PAYLOAD_TOO_LARGE', data: { message: 'File exceeds 5MB limit' } })
  if (type && !allowed.includes(type)) return createError({ statusCode: 415, statusMessage: 'UNSUPPORTED_MEDIA_TYPE', data: { message: 'Unsupported file type' } })

  // Build key and presign via AWS SDK v3 (S3-compatible R2)
  try {
    // Dynamic import so package is optional for devs who don't need this feature yet

    // @ts-ignore - optional dependency may not be installed in all environments
    const awsS3Module = (await import('@aws-sdk/client-s3')) as unknown
    // @ts-ignore - optional dependency may not be installed in all environments
    const presignerModule = (await import('@aws-sdk/s3-request-presigner')) as unknown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { S3Client, PutObjectCommand } = awsS3Module as { S3Client: any, PutObjectCommand: any }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { getSignedUrl } = presignerModule as { getSignedUrl: any }

    const endpoint = `https://${account}.r2.cloudflarestorage.com`
    const client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey }
    })

    const key = `uploads/${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: type || 'application/octet-stream' })
    const expiresIn = 300 // seconds
    const url = await getSignedUrl(client, command, { expiresIn })

    return { url, key, expiresIn }
  } catch (err: unknown) {
    // If aws sdk not installed or other error, return informative message
    const message = err instanceof Error ? err.message : String(err)
    return createError({ statusCode: 500, statusMessage: 'PRESIGN_ERROR', data: { message: `Failed to generate presigned URL: ${message}. Ensure '@aws-sdk/client-s3' and '@aws-sdk/s3-request-presigner' are installed and runtime config set.` } })
  }
})
