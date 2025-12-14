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

## [Unreleased] - v0.1.2

### Planned
- Prepare v0.1.2 release with small improvements and polish:
  - Added integration and E2E tests for recipes search and core flows
  - Accessibility fixes: `FolderSelector` and `Tags` (axe tests added)
  - Responsiveness and small UI polish for tags and folder selector
  - CI improvements: expanded matrix (Node 18/20) and release workflow
  - Updated Copilot instructions and task docs for lint/typecheck/a11y/release

### Changes in this branch
- Tests: Added `tests/integration/recipes-search-edgecases.spec.ts`, `tests/integration/recipes-e2e.spec.ts`
- Accessibility: `tests/a11y/folderselector.a11y.spec.ts`, `tests/a11y/tags.a11y.spec.ts`
- CI: `.github/workflows/ci.yml` matrix expanded; `.github/workflows/release.yml` added (release/v0.1.2)
- Docs: `.github/copilot-instructions.md` updated; `.agent/docs/tasks/v0.1.2-tasks.md` added

*See `.agent/docs/tasks/v0.1.2-tasks.md` for full details.*

*See `.agent/docs/tasks/v0.1.2-tasks.md` for detailed task list.*

---

*Full details and tasks: see `.agent/docs/tasks/v0.1.1-tasks.md`.*
