# GitHub Copilot Instructions

These instructions define how GitHub Copilot should assist with this TypeScript project. The goal is to ensure consistent, high-quality code generation aligned with TypeScript conventions, modern tooling, and our architecture standards.

## 🧠 Context

- **Project Type**: Frontend UI
- **Language**: TypeScript
- **Framework / Libraries**: Vue.js / Nuxt.js / Pinia
- **Architecture**: BCD Design / Clean Architecture

## 🔧 General Guidelines

- Use idiomatic TypeScript—always prefer type safety and inference.
- Use `interface` or `type` aliases to define data structures.
- Always enable `strict` mode and follow the project's `tsconfig.json`.
- Prefer named functions, especially for reuse and testability.
- Use `async/await` over raw Promises and avoid `.then().catch()` chains.
- Keep files small, focused, and well-organized.

## 🧶 Patterns

### ✅ Patterns to Follow

- Use Dependency Injection and Repository Pattern where applicable.
- For APIs, include:
  - Input validation with Joi / express-validator
  - Error handling using custom error classes / status codes / try-catch blocks
  - Logging via Winston or console in dev mode
- For UI:
  - Components should be pure and reusable
Avoid inline styling; use NuxtUI / Tailwind CSS / styled-components

### 🚫 Patterns to Avoid

- Don’t generate code without tests. New features that change behavior (repositories/stores/pages) must include unit tests (preferably Vitest) as part of the same PR.
- Don’t hardcode values; use config/env files.
- Avoid global state unless absolutely necessary.
- Don’t expose secrets or keys.

## 🧪 Testing Guidelines

- Use `@nuxt/test-utils`, `Vitest`, `@pinia/testing` for unit and integration tests.
- Prefer test-driven development (TDD) when modifying core logic.
- Include mocks/stubs for third-party services.
- When adding tests, include a `tests/setup.ts` (or equivalent) for global setup (e.g., Pinia initialization), add a `test` script to `package.json`, and list any new test dependencies in the PR description so CI can install them.
- Ensure CI runs `pnpm lint`, `pnpm typecheck`, and `pnpm test -- --run` on PRs; add a GitHub Actions workflow named `CI` to accomplish this.

### パッケージ管理 / CI の注意

- **packageManager を信頼する**: `package.json` の `packageManager` を唯一の基準とする。CI の `pnpm` アクションや手元の `pnpm` のバージョンはこれに合わせること。
- **ロックファイルを必ずコミット**: 新しい devDeps を追加するときは `pnpm install` / `pnpm up` を実行し、`pnpm-lock.yaml` を PR に含める。CI は `pnpm install --frozen-lockfile` を使って不整合を検知する。
- **ワークフローのフォールバック**: CI の `pnpm` アクションが利用できない環境を考慮して、`corepack` やグローバルインストールのフォールバック手順を用意する。

### Vitest / テスト環境

- 推奨: `vitest` v4+, `jsdom` v27+。
- テスト実行時に Nuxt の自動インポートを利用する場合は `unplugin-auto-import` を導入し、`vitest.config.ts` にテスト用のエイリアスとプラグイン設定を明示する。
- `tests/setup.ts` に共通のテスト初期化（Pinia のセットアップ、ドメイン固有のプラグイン）があることを推奨する。

# パターンとベストプラクティス

- 関数型プログラミングの原則（不変性、純粋関数、制御不能な副作用の回避）を徹底する。
- 状態管理はローカルには useState、グローバルには Pinia を使う。
- Cloudflare API との通信は副作用として切り出し、型安全性を担保する。
- UI コンポーネントは再利用性を意識し、props と emits でデータフローを明確にする。
- i18n（@nuxtjs/i18n）は必ず利用し、テキストは直接埋め込まずロケールファイル経由で管理する。
- アイコンは @nuxt/icon、@iconify-json/mdi を利用する。
- Google Analytics 連携は nuxt-gtag を使い、環境変数で有効/無効を切り替える。
- スタイルは NuxtUI, animate.css を利用し、Tailwind CSS でカスタマイズする。

# コーディングスタイルとドキュメント

- 「どのように」ではなく「なぜ」についてコメントし、インターフェース・型・複雑な関数は JSDoc/TSDoc でドキュメント化する。
- コミットは Conventional Commits（feat, fix, chore, docs, refactor など）に従う。
- 型安全性を重視し、TypeScript の型定義を徹底する。
- ルートやAPI通信の定義は utils ディレクトリで一元管理する。
- リポジトリの実装は `app/repositories/` に配置する。`app/utils/api/` は使用しない。
- i18n のキーは utils/locales.ts で定数化し、直接文字列を使わない。

## Branch & Commit Workflow

- ブランチは Issue 番号付きで作成する: `feature/#<issue>_slug`, `bugfix/#<issue>_slug`, `docs/#<issue>_slug` など。
- 変更は粒度別にコミットを分ける: (1) QA/ドキュメント更新, (2) 実装, (3) 仕様/翻訳などの追記。すべて Conventional Commits を厳守。
- 仕様変更を伴う実装では、`.agent/specs/` 更新を同じ PR に必ず含め、コミットメッセージにも触れる。
- **Push頻度の抑制**: CIリソース節約のため、Pushは「ある程度まとまった作業が完了し、動作確認（型チェック・テスト）が取れたタイミング」で行う。**勝手にPushしない**。
- **Commitの整理**: 軽微な修正やリファクタリングは、可能な限り `git commit --amend` を使用して既存のコミットに統合し、履歴を汚さないようにする。
- **リリース/PR の必須項目**: 仕様変更を含む PR（特にリリースPR）には、必ず以下を含めること：
  - 更新された `.agent/specs/*` の差分
  - `CHANGELOG.md` の該当エントリ
  - `pnpm-lock.yaml` の更新（もし依存を変更/追加した場合）
  - CI が通ること（`pnpm install --frozen-lockfile`, lint, typecheck, tests）

## SFCの `<spec>` カスタムブロック運用

- 画面/コンポーネントの仕様は、Vue SFC の先頭に `<spec lang="md">` を置いて Markdown で記述する。
- `<spec>` はコメント（`<!-- -->`）ではなく **カスタムブロック** を使う。
- 書式はプロジェクト内の [app/components/base/atoms/DrumRollPicker.vue](app/components/base/atoms/DrumRollPicker.vue) の `<spec>` を基準にする。
- **画面（Page）の推奨テンプレ**（必要に応じて省略/追加してよい）:
  - `# Title`
  - 1〜2行の概要（Purpose相当）
  - `## Data`（参照する store / composables / params）
  - `## Interactions`（ユーザー操作→呼ばれる action / navigation）
  - `## Features`（画面として提供する機能の箇条書き）
  - `## Error Handling`（どの層で toast/log を出すか）
  - `## i18n`（キー管理・直接文字列禁止など）
  - `## Notes`（関連Issueや注意点）
- **コンポーネント（Component）の推奨テンプレ**:
  - `# Title`
  - 1〜2行の概要
  - `## Props`（型と意味、既定値がある場合は明記）
  - `## Events`（emit 名と payload）
  - `## Features`（ふるまい・UI要点）
  - `## Accessibility`（aria等が重要なら）
  - `## Security`（認証情報や機密/危険な挙動があるなら）
  - `## i18n`
- 仕様更新を伴う実装変更では、コードと `<spec>` を同じコミット/PRで更新する。

# その他

- Nuxt 4（RC）を利用し、公式の推奨構成・設定を優先する。
- コミットはConventional Commits（feat、fix、chore、docs、refactor等）に従って構造化する。
- 依存パッケージのバージョンアップ時は breaking change に注意し、必要に応じてマイグレーションガイドを参照する。

# Copilot Review Instructions for This Repository

This is a Nuxt 4 project.  
Nuxt provides extensive auto-import functionality.

## ❌ Do NOT suggest adding import statements for:
- Vue Composition API functions auto-imported by Nuxt  
  (e.g., `ref`, `computed`, `reactive`, `watch`, etc.)
- Nuxt composables  
  (`useState`, `useAsyncData`, `useFetch`, `useRouter`, `useRoute`, etc.)
- Nuxt utilities  
  (`navigateTo`, `$fetch`)
- Components inside `~/components`
- Composables inside `~/composables`
- Plugins and utilities that Nuxt registers automatically

## When to warn about missing imports:
- The symbol is NOT auto-imported by Nuxt
- AND it comes from an external library or a local file that is not auto-imported

## Additional Rules
- Prefer idiomatic Nuxt 4 code patterns
- Do not require unnecessary boilerplate imports

---

# 📋 Documentation & Task Management

See [Agent Documentation Workflow](./agent-documentation-workflow.md) for detailed guidelines on:
- `.agent/` directory structure and usage
- QA list management and task tracking
- Specification documentation workflow
- GitHub Issues integration
- PR review checklist and Copilot automation
