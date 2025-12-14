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
