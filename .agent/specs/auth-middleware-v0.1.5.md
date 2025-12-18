# Auth middleware migration (v0.1.5)

This document records the design decision and implementation details for moving page-level redirect handling to a client-side Nuxt route middleware.

Summary
- Migration performed in release branch `release/v0.1.5`.
- Client middleware: `app/middleware/auth.client.ts` (client-only route middleware).
- Composable change: `app/composables/useAuth.ts` no longer performs navigation side-effects; `login()`/`register()` return the user and leave navigation to pages.
- Page contract: protected pages must set `definePageMeta({ requiresAuth: true })`. Login/register pages should read `route.query.redirectTo` and perform `navigateTo(redirectTo || '/')` after successful login/register.

Rationale
- Centralizing redirect logic in middleware provides consistent behavior during CSR/SSR transitions and avoids surprising navigation from server-only handlers.
- Keeps `useAuth` testable and side-effect free (pure API wrapper + state management).

Implementation Notes
- `auth.client.ts` responsibilities:
  - await `auth.initAuth()` (ensure session state available).
  - If route is under `/auth` and user is authenticated -> redirect to `redirectTo` or `/`.
  - If route is protected (`requiresAuth: true`) and user is unauthenticated -> redirect to `/auth/login?redirectTo=<encoded-current-path>`.
  - Use `navigateTo()` on client only.
- `useAuth` responsibilities after migration:
  - Provide `initAuth()`, `login()`, `register()`, `logout()` and expose `isAuthenticated` state.
  - Not perform any `navigateTo()` calls.

Testing
- Added unit tests: `tests/middleware/auth.client.spec.ts` covering both redirect directions and `redirectTo` encoding.
- Updated `tests/stores/useAuth.spec.ts` to assert `login()`/`register()` return user and do not navigate.
- Integration tests adjusted where necessary (e.g., `tests/integration/auth-refresh.spec.ts`).

Docs
- `.agent/specs/auth.md` updated to reference this migration.
- `CHANGELOG.md` Unreleased section updated with a short note pointing to these specs.

Next steps (recommended)
- Add an E2E/browser test that verifies full browser navigation flow (visit protected page -> redirect to login -> login -> redirected back).
- Update developer onboarding notes to highlight `redirectTo` convention for pages that perform login/register.

