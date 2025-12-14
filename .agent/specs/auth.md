# Authentication Spec

Purpose: Define the authentication contract and operational requirements for Cloudflare Workers-backed auth used by the application.

Overview
- Session model: cookie-based refresh token (long-lived) + short-lived access token used by server. Client does not persist tokens in localStorage; auth state is derived from server via `/api/auth/me`.
- Access token TTL: 15 minutes (short-lived)
- Refresh token TTL: 30 days
- Refresh token storage: `Set-Cookie` HttpOnly, Secure, SameSite=Lax (or Strict if app constraints allow) with `Path=/` and `Max-Age` set according to TTL.

Endpoints
- POST `/api/auth/login`
  - Request: `{ email: string, password: string }`
  - Response: `200 { user: { id, name, email } }` and sets refresh cookie (HttpOnly)
- POST `/api/auth/register`
  - Request: `{ name: string, email: string, password: string }`
  - Response: `200 { user }` and sets refresh cookie
- POST `/api/auth/logout`
  - Request: no body
  - Response: `204` and clears cookie
- GET `/api/auth/me`
  - Request: no body (cookie sent automatically)
  - Response: `200 { user | null }`
- POST `/api/auth/refresh` (internal, optional)
  - Request: cookie only
  - Response: `200 { user }` and rotates refresh cookie

Security Considerations
- Use HTTPS for all auth flows
- Refresh token rotation: issue a new refresh token on successful refresh and invalidate previous token (store a token identifier server-side)
- Implement token revocation endpoint and an administrative mechanism to revoke tokens (logout all sessions)
- Protect against CSRF: use SameSite cookies and require `X-Requested-With` or Origin checks for stateful endpoints; consider double-submit cookie for unsafe cross-site operations
- Store minimal user info in cookie payload (server-side storage for session metadata)

Error handling
- 401: invalid credentials or expired refresh
- 429: rate limit for login attempts
- 500: server errors

Testing requirements
- Unit: repository / worker unit tests for auth handlers and token lifecycle
- Integration: `/api/auth` endpoints using a test Workers environment or a stubbed in-memory store
- E2E: refresh flow (simulate cookie set/refresh/expiry) to ensure client-side session is correctly initialized by `/api/auth/me`

Acceptance criteria
- `.agent/specs/auth.md` contains above contract
- Implementation PR includes unit/integration tests and E2E smoke for refresh
- CHANGELOG and QA updated to reference the authentication design
