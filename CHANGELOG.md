# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.1] - 2025-12-14

### Added
- Folders API and data store (`GET /folders`, `POST /folders`, `PUT /folders/:id`, `DELETE /folders/:id`, `GET /folders/hierarchy`)
- Tags API, client, store and UI
- Recipe checks API + UI (history and stats)
- Search & filter support on `/recipes` (`q`, `folderId`, `tagIds`)
- Basic unit tests (Vitest) for stores and test setup
- CI workflow for lint, typecheck and tests
- Dependabot config for dependency updates

### Changed
- Upgraded test and state dependencies: `vitest`, `pinia`, `jsdom`

### Fixed
- Lint and TypeScript issues preventing CI
