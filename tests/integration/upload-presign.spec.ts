import { test, expect } from 'vitest'

const hasR2 = Boolean(process.env.R2_BUCKET && process.env.CLOUDFLARE_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY)

const maybeTest = hasR2 ? test : test.skip

maybeTest('E2E: presign -> PUT upload to Cloudflare R2', async () => {
  const name = 'e2e-test.png'
  const type = 'image/png'
  // Minimal PNG header bytes (small payload)
  const body = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const size = body.length

  // Request presign from server
  const res = await $fetch('/api/upload/image', { method: 'POST', body: { name, size, type } })
  expect(res).toHaveProperty('url')
  expect(res).toHaveProperty('key')
  expect(res).toHaveProperty('expiresIn')

  // Upload via PUT to presigned URL
  const putRes = await fetch(res.url as string, { method: 'PUT', headers: { 'Content-Type': type }, body })
  // S3/R2 presigned PUT commonly returns 200/201/204
  expect(putRes.ok).toBeTruthy()

  // Optional: attempt to GET the object to verify availability
  // This may fail if the bucket is private; treat PUT success as primary verification.
})
