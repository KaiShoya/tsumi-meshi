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

### Release metadata
- Commit: `c7ed7fa` (chore/specs-enforcement)
- PR: https://github.com/KaiShoya/tsumi-meshi/pull/6

---

*Full details and tasks: see `.agent/docs/tasks/v0.1.1-tasks.md`.*
