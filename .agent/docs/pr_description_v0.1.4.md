# PR: release/v0.1.4 — Summary

This PR collects the work for v0.1.4 focusing on the folder UI, lightweight i18n, SFC `<spec>` support, and an R2 image upload presign API.

## Key changes
- Add support for SFC `<spec lang="md">` blocks in dev/test via a small Nuxt/Vite loader plugin (`nuxt.config.ts`). This prevents Markdown in SFCs from breaking transforms in tests.
- Implement a lightweight i18n composable `useI18n` with `locales/ja.json` and `locales/en.json`, and add a `LanguageSwitcher` in the header. Many UI strings were migrated to `t()`.
- Folder UI: repositories, data/page stores, `FolderTree.vue`, `FolderCreateModal.vue`, and `FolderEditModal.vue` implemented and tested. Related Vitest tests are included and passing.
- Cloudflare R2 presign API: `server/api/upload/image.post.ts` — generates presigned PUT URLs using AWS SDK v3 via dynamic imports (optional dependency). Server-side validation for file size and mime types implemented.
- Client-side: `app/composables/useUpload.ts` and `app/components/ImageUploader.vue` added as a minimal upload flow demo.

## Tests & quality
- All lint, typecheck and Vitest runs were executed locally and are passing.

## Notes for reviewers
- The presign implementation requires runtime config values (R2_BUCKET, CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) to be set for full end-to-end testing.
- The AWS SDK packages are loaded dynamically; maintainers can choose to install the deps if they'd like local presign verification.
- Some UI integration points for image uploads remain (integration into recipe forms and displaying uploaded images).

## Checklist
- [x] Lint passing
- [x] Typecheck passing
- [x] Tests passing
- [x] Docs/specs updated (`.agent/specs` / `.agent/docs`)

---

Commit: chore: fix lint/typecheck issues (i18n, upload presign)
Branch: release/v0.1.4
