# Repository API

## Overview
Repository pattern implementation for data access abstraction. All repositories handle Cloudflare D1 database operations.

Note: `app/repositories/*` are server-side implementations (Cloudflare Workers / D1). Frontend code must not import these files directly; instead use the centralized frontend API client at `app/utils/api/client.ts` (exported as `apiClient`) to talk to the Workers endpoints. This keeps client bundles lean and avoids leaking server-side implementation into the browser.

## Repository Classes

### RecipesRepository
Handles recipe CRUD operations.

#### Methods
- `fetchAll(userId: number): Promise<Recipe[]>`
- `fetchById(id: number, userId: number): Promise<Recipe | null>`
- `create(recipe: RecipeInput, userId: number): Promise<Recipe>`
- `update(id: number, recipe: RecipeUpdate, userId: number): Promise<Recipe>`
- `delete(id: number, userId: number): Promise<void>`
- `search(query: string, userId: number): Promise<Recipe[]>`
- `filterByFolder(folderId: number, userId: number): Promise<Recipe[]>`
- `filterByTags(tagIds: number[], userId: number): Promise<Recipe[]>`

### FoldersRepository
Handles folder hierarchy operations.

#### Methods
- `fetchAll(userId: number): Promise<Folder[]>`
- `fetchById(id: number, userId: number): Promise<Folder | null>`
- `create(folder: FolderInput, userId: number): Promise<Folder>`
- `update(id: number, folder: FolderUpdate, userId: number): Promise<Folder>`
- `delete(id: number, userId: number): Promise<void>`
- `getHierarchy(userId: number): Promise<FolderTree[]>`

### Folder API Endpoints
The Workers API exposes folder-related endpoints. All endpoints require authentication (JWT).

- `GET /folders`
  - Response: `{ folders: Folder[] }` (flat list)
- `GET /folders/hierarchy`
  - Response: `{ folders: FolderTree[] }` (nested hierarchy)
- `POST /folders`
  - Request body: `{ name: string, parentId?: number | null }`
  - Response: `{ folder: Folder }`
- `PUT /folders/:id`
  - Request body: `{ name?: string, parentId?: number | null }`
  - Response: `{ folder: Folder }`
- `DELETE /folders/:id`
  - Response: `{ success: true }`

### Upload API Endpoints

These endpoints support client-side uploads to Cloudflare R2 via server-generated presigned URLs.

- `POST /api/v1/upload/image`
  - Purpose: Generate upload metadata or presigned URL for the client to upload an image file to R2.
  - Request body (JSON):
    - `name` (string, required): original filename
    - `size` (number, required): file size in bytes
    - `type` (string, optional): MIME type
  - Validation:
    - Max size: 5 * 1024 * 1024 (5MB)
    - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
  - Response (success):
    - Option A (presigned PUT): `{ url: string, key: string, expiresIn: number }`
    - Option B (presigned POST): `{ url: string, fields: Record<string,string>, key: string, expiresIn: number }`
    - Option C (server-upload proxies): `{ ok: true, key: string }` (not preferred)
  - Response (error): standard H3 error structure with `statusCode` and `data.message`.
  - Notes: The server is responsible for generating a secure, short-lived presigned URL using R2 credentials. The client will PUT/POST the file directly to R2 and then send the resulting `key` back to the app when saving the recipe.

  #### Presign API — Detailed Spec

  - Endpoint: `POST /api/v1/upload/image`
  - Authentication: required (JWT)
  - Request (application/json):
    - `name` (string) — original filename, required
    - `size` (number) — bytes, required
    - `type` (string) — MIME type, optional

  - Validation rules:
    - `size` must be <= 5_242_880 (5MB)
    - `type` if present must be one of `image/jpeg`, `image/png`, `image/webp`

  - Success Response (200):
    - `url` (string) — presigned URL that accepts an HTTP PUT with `Content-Type` set to the requested MIME type
    - `key` (string) — storage key (object key) to persist on the recipe record
    - `expiresIn` (number) — seconds until URL expiration

  - Error responses:
    - 400 BAD_REQUEST — missing `name` or `size` or invalid types
    - 413 PAYLOAD_TOO_LARGE — `size` exceeds 5MB
    - 415 UNSUPPORTED_MEDIA_TYPE — `type` not allowed
    - 501 R2_NOT_CONFIGURED — server R2 credentials not present (development fallback)
    - 500 PRESIGN_ERROR — underlying presign generation failed (e.g., missing optional SDK)

  - Client flow (recommended):
    1. Client requests presign: POST `/api/v1/upload/image` with `{ name, size, type }`.
    2. Server returns `{ url, key, expiresIn }`.
    3. Client issues `PUT` to `url` with headers: `Content-Type: <type>` and body = file bytes.
    4. On successful PUT (HTTP 200/201/204), client includes `imageKey` or `imageUrl` (constructed from `key`) in recipe create/update payload.
    5. Server persists `image_url` (or `image_key`) on recipe record.

  - Test / E2E notes:
    - E2E should verify the full lifecycle: presign → PUT upload → GET/HEAD object or use R2 API to confirm object exists → cleanup (DELETE).
    - For CI, mark the R2 E2E job as opt-in and require secrets: `R2_BUCKET`, `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and optionally `R2_ENDPOINT`.
    - Use a small binary (1–10 KB) image fixture for uploads.
    - Ensure the client uses the returned `Content-Type` when performing the PUT; some S3-compatible endpoints validate this header during presign.


Security and Billing:
- Authenticate requests to `/api/v1/upload/image` (user must be signed in).
- Enforce file size and type limits server-side.
- Consider virus scanning or image sanitization if accepting uploads from untrusted sources.

Integration:
- Repositories and page stores that save recipes should accept an `imageKey` or `imageUrl` returned after upload and persist it on the recipe record. The URL served in the UI can be constructed as `https://<account>.r2.cloudflarestorage.com/<bucket>/<key>` or via a CDN domain.

Notes:
- API responses use snake_case on the Workers side; repository and frontend map to camelCase types in code.
- Integration tests for these endpoints should verify authentication, validation (e.g., missing name), and effects on `recipes.folder_id` when folders are deleted or moved.

### TagsRepository
Handles tag management.

#### Methods
- `fetchAll(userId: number): Promise<Tag[]>`
- `fetchById(id: number, userId: number): Promise<Tag | null>`
- `create(tag: TagInput, userId: number): Promise<Tag>`
- `update(id: number, tag: TagUpdate, userId: number): Promise<Tag>`
- `delete(id: number, userId: number): Promise<void>`
- `findOrCreate(name: string, userId: number): Promise<Tag>`

### RecipeChecksRepository
Handles check history.

#### Methods
- `fetchByRecipe(recipeId: number, userId: number): Promise<RecipeCheck[]>`
- `create(recipeId: number, userId: number): Promise<RecipeCheck>`
- `getStats(userId: number, period: 'month' | 'week'): Promise<CheckStats>`

### UsersRepository
Handles user operations.

#### Methods
- `findByEmail(email: string): Promise<User | null>`
- `create(user: UserInput): Promise<User>`
- `update(id: number, user: UserUpdate): Promise<User>`

## Error Handling Strategy
All repository methods throw `CustomError` instances with appropriate error codes:
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `DATABASE_ERROR`: Database operation failed
- `PERMISSION_DENIED`: Access denied

## Data Types
```typescript
interface Recipe {
  id: number
  userId: number
  folderId?: number
  title: string
  url: string
  description?: string
  imageUrl?: string
  tags: Tag[]
  checks: RecipeCheck[]
  createdAt: Date
  updatedAt: Date
}

interface Folder {
  id: number
  userId: number
  name: string
  parentId?: number
  children?: Folder[]
  createdAt: Date
  updatedAt: Date
}

interface Tag {
  id: number
  userId: number
  name: string
  createdAt: Date
}

interface RecipeCheck {
  id: number
  recipeId: number
  checkedAt: Date
}

interface User {
  id: number
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}
```

## API Integration
Repositories implement server-side data access and may be used by Cloudflare Workers handlers. Frontend applications should call the Workers HTTP endpoints via `apiClient` (see `app/utils/api/client.ts`) rather than importing server-side repository files into client bundles.

### Notes
- The `/recipes` endpoint supports optional query parameters for search and filtering: `q` (search in title/description/url), `folderId` (numeric), and `tagIds` (comma-separated tag ids). Repositories should provide corresponding methods (e.g., `search(query, userId)` and `filterByFolder`/`filterByTags`) that map to these query parameters.
- Recipe checks endpoints are provided: `POST /recipes/:id/checks`, `GET /recipes/:id/checks`, and `GET /checks/stats` (period: `month` | `week`). Implementations should use `RecipeChecksRepository` (`fetchByRecipe`, `create`, `getStats`) and include tests for stats aggregation.
- When API surface changes, update the corresponding repository method signatures and add unit/integration tests in the same PR.
