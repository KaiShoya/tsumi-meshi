# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Summary
Planned changes for v0.1.5: dashboard & analytics, deploy/CI improvements, performance work, and Chrome extension scaffolding.

### To be added
- CI / Deploy: Pages + Workers deployment verification and opt-in E2E for R2
- Performance: Lighthouse improvements and related fixes

### Recent infra & test updates
- Adopt `@nuxtjs/i18n` for runtime i18n support; `nuxt.config.ts` updated to include `i18n` settings (locales, `langDir`, `vueI18n` config).

### Security / Auth (unreleased)
- Move client-side redirect handling to `app/middleware/auth.client.ts`; updated `useAuth` to remove navigation side-effects and pages to use `redirectTo` query parameter after login/register. See `.agent/specs/auth.md` and `.agent/specs/auth-middleware-v0.1.5.md` for details.
- Stabilize tests for i18n: add `vue-i18n` as a devDependency and register `createI18n` in `tests/setup.ts` so `useI18n()` works under Vitest.
- Update `vitest.config.ts` AutoImport to include `vue-i18n` so test auto-imports resolve `useI18n`.
- Removed development `plugins/` stubs and migrated required UI stubs into test setup to avoid shipping dev-only runtime code.

## [v0.1.5] - 2025-12-19

### Summary
Bugfix release addressing dashboard SSR/auth edgecases, E2E coverage and test/lint stability.

### Added
- E2E smoke test for dashboard statistics to verify `/api/v1/stats` response and payload shape.

### Changed
- Prevent dashboard stats API from being fetched during server-side module evaluation (use client-only `useAsyncData(..., { server: false })`) to avoid transient 401 logs on page reload.
- Improve auth cookie handling in Workers for local development: avoid `Secure` flag and use `SameSite=Lax` on localhost so browsers accept session cookies over HTTP during local dev.
- Dashboard UI: responsive layout and null-safe template access to avoid type errors and transient error states on reload.

### Fixed
- Fix transient 401 Unauthorized logs on page reload by ensuring client-side session initialization and avoiding SSR stats fetch.
- Lint/typecheck and test-suite fixes; full local test run passing.

### Release metadata
- Commit: fix(dashboard,auth): avoid SSR stats fetch on reload; adjust auth cookie handling for local dev


## [v0.1.4] - 2025-12-16

### Summary
今回のリリースではフォルダ管理周りのUI実装、ストア／リポジトリの改良、テスト修正とドキュメント（spec）整備に加え、SFC `<spec>` ブロックの取り扱いや画像アップロード（R2 presign）機能、軽量な i18n の導入、開発支援ルールの整備を行いました。

### Added
- フォルダ UI コンポーネント: `FolderTree`, `FolderNode`, `FolderSelector`、作成/編集モーダル、ページ統合（`app/pages/folders/*`、`app/components/*`）
- データ/ページストアとリポジトリの更新: `app/stores/data/folders.ts`, `app/stores/pages/folders.ts`, `app/repositories/folders.ts`（レシピのフォルダ更新処理を含む）
- テスト: `apiClient` をモックする形へテストを更新、フォルダ関連のユニット/統合テストを追加・修正
- ドキュメント: 複数の `.vue` ファイルに `<spec lang="md">` ブロックを追加し、`.agent/docs/tasks`／QA の該当エントリを更新
- SFC `<spec lang="md">` をビルド/テスト時に安全に扱う Nuxt/Vite loader を導入
- 画像アップロード（Cloudflare R2）用の presign API とクライアント実装: `server/api/upload/image.post.ts`, `app/composables/useUpload.ts`, `app/components/ImageUploader.vue` を追加
- 軽量な `useI18n` composable とロケールファイルを追加して一部画面で `t()` を導入
- 環境テンプレート: `.env.template` を追加（R2 / JWT 等の必須環境変数を記載）
- E2E用の統合テスト（R2 presign）を追加（環境変数が未設定の場合はスキップ）: `tests/integration/upload-presign.spec.ts`
- 開発支援ルール: `.github/copilot-coding-rules.md` を追加（Copilot と自動支援のための運用ルール）

### Changed
- ストアの一部でグローバル `$fetch` から `apiClient` へ移行（テストを合わせて修正）
- lint / typecheck の指摘に対応するための小修正

### Fixed
- SFC の import/テスト環境での解析エラーを防ぐため、カスタム `<spec>` ブロック配置を整理

### Release metadata
- PR: https://github.com/KaiShoya/tsumi-meshi/pull/26 (feat: folder UI + stores + tests + docs (v0.1.4))


## [v0.1.3] - 2025-12-14

### Summary
Minor completion of TODOs and API surface parity between client and server.

### Added
- Implemented `tags` and `recipes` data store API calls (`app/stores/data/tags.ts`, `app/stores/data/recipes.ts`) using `apiClient` and added unit tests.
- Added global UI store (`app/stores/ui.ts`) to manage loading state used by page stores.
 - Added `useAppToast` wrapper (`app/composables/useAppToast.ts`) to centralize toast behavior (success/info/warning/error) using NuxtUI, with unit tests; the implementation safely no-ops when NuxtUI is unavailable (test/runtime resilience).

### Changed
- Updated `app/stores/pages/recipes.ts` to use global loading state.
- Replace console.error with user-facing toast on home page check toggle failure (`app/pages/index.vue`).
- Replace various `console.error` calls with `useLogger.error` and user-facing toasts in page stores and pages (`app/stores/pages/*`, `app/pages/index.vue`).

### Fixed
- Suppress Vue unresolved-component warnings in dev/test by adding lightweight Nuxt UI stubs and ensuring layout usage:
  - Added `plugins/00-nuxt-ui-stubs.ts` and `plugins/nuxt-ui-stubs.ts` to register safe stubs for `@nuxt/ui` components during development/tests.
  - Updated `app/app.vue` / `app/layouts/default.vue` to use `<NuxtLayout>` to avoid "NuxtLayout not used" warning.
  - Added test global component stubs in `tests/setup.ts` to keep Vitest output clean.

### Security / Auth
- Implemented client-side authentication flows backed by Cloudflare Workers endpoints:
  - `app/composables/useAuth.ts` now integrates with `apiClient` and exposes `initAuth`, `login`, `register`, and `logout`.
  - `apiClient.logout()` added to call `POST /api/v1/auth/logout` and clear session state.
- `useAuth` prefers Nuxt's global `$fetch` in test environments (Vitest stubs) and falls back to `apiClient` at runtime to keep tests stable while preserving runtime behavior.

### Observability
- Added safe logging adapter `app/composables/useLogger.ts` that integrates with an external monitoring agent when present and falls back to console logging. Page stores and pages were updated to use `useLogger.error` instead of raw `console.error` where applicable.

### Tests
- Added `tests/stores/tags.spec.ts`, extended `tests/stores/recipes.spec.ts`, and added `tests/stores/ui.spec.ts`.


## [v0.1.2] - 2025-12-14

### Summary
Small improvements, tests, and accessibility fixes ahead of v0.1.2 release.

### Added
- Integration/E2E tests for recipe search and core flows
- Accessibility tests and fixes: `FolderSelector` and `Tags` (axe tests added)

### Changed
- UI polish: responsiveness improvements for tags and folder selector
- CI improvements: updated Node.js matrix to supported versions (Node 24/25) and added release workflow

### Docs
- Updated Copilot instructions and task docs for lint/typecheck/a11y/release

### Changes in this release
- Tests: Added `tests/integration/recipes-search-edgecases.spec.ts`, `tests/integration/recipes-e2e.spec.ts`
- Accessibility: `tests/a11y/folderselector.a11y.spec.ts`, `tests/a11y/tags.a11y.spec.ts`
- CI: `.github/workflows/ci.yml` matrix updated; `.github/workflows/release.yml` added
- Docs: `.github/copilot-instructions.md` updated; `.agent/docs/tasks/v0.1.2-tasks.md` added


## [v0.1.1] - 2025-12-14

### Summary
Release focused on folders, tags, recipe checks (history + stats), and search/filter functionality. Added UI, stores, backend endpoints, tests (unit + integration), and CI/docs enforcement tooling.

### Added
- Folders: API endpoints and UI
  - `GET /folders`, `POST /folders`, `PUT /folders/:id`, `DELETE /folders/:id`, `GET /folders/hierarchy`
  - `app/stores/data/folders.ts`, `app/stores/pages/folders.ts`, `app/pages/folders/index.vue`, `app/components/FolderSelector.vue`
  - Unit tests and integration tests: `tests/stores/folders.spec.ts`, `tests/repos/folders.spec.ts`, `tests/integration/folders.spec.ts`
- Tags: API, client, store and UI
- Recipe checks: API endpoints, repository, UI and stats view
  - `POST /recipes/:id/checks`, `GET /recipes/:id/checks`, `GET /checks/stats`
  - Unit tests and integration tests: `tests/stores/checks.spec.ts`, `tests/integration/checks.spec.ts`
- Search & Filter: backend and frontend support (`q`, `folderId`, `tagIds`) and tests
- CI / Docs enforcement
  - PR template requiring spec/docs/tasks updates
  - `Specs Check` GitHub Action to validate PRs touch `.agent/specs` or `.agent/docs/tasks` when code/API changes
- Vitest test setup and initial test coverage improvements

### Changed
- Dependencies updated: `vitest`, `pinia`, `jsdom` and related test tooling

### Fixed
- Various lint/typecheck issues blocking CI
 - Added missing integration tests for `GET /recipes` search and verified CI locally (commits: `bab6236`, `1b5475a`)

### Release metadata
- Commit: `c7ed7fa` (chore/specs-enforcement)
- PR: https://github.com/KaiShoya/tsumi-meshi/pull/6
