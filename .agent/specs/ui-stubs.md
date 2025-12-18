# UI Stubs Plugin

Purpose
- Explain why lightweight Nuxt UI component stubs were added.

Background
- During development and tests, the project uses `@nuxt/ui` components (UForm, UInput, UFormField, etc.).
- Some environments (test runner / early plugin load order) produced Vue warnings:
  - "Failed to resolve component: UFormField"
  - "Extraneous non-props attributes ..." when stubs returned fragments
  - "NuxtLayout not used" when layout wrapper was missing

Design
- Implement two complementary measures:
  1. `plugins/00-nuxt-ui-stubs.ts`: early-loaded plugin that registers lightweight component stubs for commonly used `@nuxt/ui` components. Stubs render a simple `div` root and forward attributes/events to avoid Vue warnings about extraneous attributes and non-emits.
  2. `plugins/nuxt-ui-stubs.ts` and `tests/setup.ts`: provide fallbacks and test-time stubs so Vitest/VTU do not show unresolved component warnings.
- Keep stubs minimal and safe: they only render `slots.default()` and forward `attrs` to the root `div`.

Behavior
- The plugin is intentionally named with a numeric prefix (`00-`) so Nuxt loads it early.
- The stubs register both PascalCase (`UFormField`) and kebab-case (`u-form-group`) component names.
- The stubs use `inheritAttrs: true` and forward `attrs` as a `Record<string, unknown>` to avoid `any` in TypeScript and prevent extraneous-attribute warnings.

- When to update
- If the project adopts a global UI theming or server-side UI rendering that requires actual `@nuxt/ui` components, remove the stubs and rely on the real package.
-
-Release
- Applied in: v0.1.3 (2025-12-15)
- If additional components from `@nuxt/ui` are used, add them to the stub lists in `plugins/00-nuxt-ui-stubs.ts` and `plugins/nuxt-ui-stubs.ts` and tests/setup.

Notes
- This is a pragmatic mitigation for dev/test environments. Production builds that include `@nuxt/ui` should not rely on stubs.
