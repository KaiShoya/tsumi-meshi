# CI, パッケージ管理、依存関係ポリシー

この仕様は v0.1.1 の作業中に出てきた運用上の教訓と合意事項をまとめたもの。CI の安定性、ロックファイルの扱い、依存関係更新フローに関するチーム規約を提示する。

## 目的
- CI の再現性を保ち、開発者がローカルで確認した状態と CI の状態に差異が出ないようにする。
- 依存関係の更新手順と自動化（Dependabot）に関するルールを明確にする。

## ルール

- **パッケージマネージャ**: プロジェクトは `package.json` の `packageManager` を単一のソース・オブ・トゥルースとして扱う。CI ワークフローで使用する `pnpm` アクションのバージョンは必ず `packageManager` に揃えること（例: `pnpm@10.23.0`）。

- **ロックファイルの扱い**: `pnpm-lock.yaml` を更新する必要がある変更（依存追加・更新）はローカルで `pnpm install` / `pnpm up` を実行し、必ずロックファイルをコミットして PR に含める。CI では `pnpm install --frozen-lockfile` を使い、ロックファイルと package.json の不整合を検知する。

- **CI ワークフロー**: ワークフローは以下を必ず実行する：`pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test -- --run`。`pnpm` が稼働していない環境を考慮して、ワークフローには `pnpm` の検証とフォールバック手順（Corepack / グローバルインストール）を入れる。

- **テスト環境**: Vitest (v4+) と jsdom (v27+) を推奨。テストで Nuxt/Vue の自動インポートを利用する場合は `unplugin-auto-import` を使い、`vitest.config.ts` にテスト用のエイリアスとプラグイン設定を明示する。

- **Dependabot**: 自動 PR を受け入れる場合でも、ロックファイルの更新と CI の通過を確認してからマージする。重大なメジャーアップデートは必ず人がレビューして移行手順を確認する。

## 付随手順（チェックリスト）

- 新しい devDependencies を追加したら：
  - ローカルで `pnpm install` を実行
  - `pnpm-lock.yaml` の差分をコミット
  - PR の説明に依存の追加理由とテスト結果を書き添える

- CI が `pnpm install --frozen-lockfile` で失敗した場合：
  - ローカルで `pnpm install` → `pnpm up` を実行し、ロックファイル差分をコミットして PR を更新する

## 変更履歴
- 2025-12-14: 初版（v0.1.1 の運用経験に基づく）

## v0.1.2 での追加規約

- **Lint / Typecheck を必須化**: すべての開発者はコード変更後に `pnpm lint` と `pnpm typecheck` を実行し、PR を作成する前に問題を解消すること。CI はこれを必須として検証する。
 - **Lint / Typecheck を必須化**: すべての開発者はコード変更後に `pnpm lint` と `pnpm typecheck` を実行し、PR を作成する前に問題を解消すること。CI はこれを必須として検証する。
 - **pre-commit フック**: リポジトリに `husky` + `lint-staged` を導入済み。コミット前に `pnpm lint --fix` と `pnpm typecheck` が実行されるため、ローカルでの早期検出が期待できる。
- **リリース PR の CHANGELOG 更新を必須化**: `release/*` ブランチの PR は `CHANGELOG.md` にエントリを追加すること（`Specs Check` ワークフローで自動検出）。
- **E2E スモークの運用方針**: E2E スモークテストは当面 `release/*` ブランチまたはスケジュール実行で走らせる。将来的に CI コストと効果を評価して PR 実行を拡張する。
 - **E2E スモークの運用方針**: E2E スモークテストは当面 `release/*` ブランチまたはスケジュール実行で走らせる。将来的に CI コストと効果を評価して PR 実行を拡張する。

## 推奨 CI ワークフロー（テンプレ）

最低限、PR の CI は以下を実行してください:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint --max-warnings=0`
3. `pnpm typecheck`
4. `pnpm test -- --run`

このワークフローはブランチ保護ルールで必須化することを推奨します。R2/外部 E2E はオプトインのジョブとして切り分け、必要なシークレットがない場合はスキップされるようにしてください。
- **アクセシビリティ自動テスト**: UI を修正する PR は `axe-core` を使った a11y テストを同一 PR に含めること。プロジェクトは `tests/a11y/*.a11y.spec.ts` の運用を始めた。

