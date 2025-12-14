# Changelog

All notable changes to this project will be documented in this file.

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

*See `.agent/docs/tasks/v0.1.2-tasks.md` for full details.*

---

*Full details and tasks: see `.agent/docs/tasks/v0.1.1-tasks.md`.*
