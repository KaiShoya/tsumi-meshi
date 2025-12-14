# コーディング規約（エッセンシャル）

このファイルはリポジトリで守るべき最小限のコーディングルールとチェック手順をまとめたものです。

目的:
- lint と typecheck による CI 失敗を減らす
- 開発者間で一貫したスタイルとエラーハンドリングを保つ

主要ルール（要点）:
- 常に `pnpm lint` と `pnpm typecheck` を走らせ、エラーが残らない状態で PR を作成する。
- テンプレート関連の ESLint ルールを尊重する（例: `vue/max-attributes-per-line`, `vue/attribute-hyphenation`, `vue/html-self-closing`）。
- 未使用の変数や不要な代入を避ける（`no-unused-vars`）。
- `console.error` を直接使わず、`useLogger().error(...)` と `useAppToast()` を組み合わせてユーザーに通知する。
- 型安全を優先する。`any` の使用は最小限に留め、必要な場合は理由をコメントで記載する。

テンプレートと属性ルール（よくある警告回避）:
- コンポーネントの属性は複数ある場合、1つずつ改行する。
  例:
  ```vue
  <div
    class="..."
    role="dialog"
    aria-modal="true"
  >
  ```
- カスタムコンポーネントの props をテンプレートで渡す際はハイフン化（`confirm-label` のように）を使う。自動的にキャメルケース → ハイフン変換されることを前提にする。
- 空の要素（overlay など）は自己終了または明示的に閉じるタグを使う（`<div/>` や `<div></div>` の一貫性）。

テスト / 開発環境:
- VTU / Vitest のテスト環境では UI ライブラリのコンポーネントを最初にスタブするプラグインを用いる（既存 `plugins/00-nuxt-ui-stubs.ts` を参照）。

チェック手順（開発者ワークフロー）:
1. 変更前に `pnpm lint` を実行し、警告/エラーを確認する。
2. `pnpm typecheck` を実行して型エラーを解消する。
3. 必要に応じて `pnpm exec eslint --fix` を使い、自動修正を適用する。
4. ローカルで `pnpm test` を実行してテストが通ることを確認する。

CI 要求（PR マージ前）:
- CI は少なくとも `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test` を通すこと。

将来的な改善案:
- `husky` + `lint-staged` を導入して `pre-commit` で `eslint --fix` と型の簡易チェックを走らせる。
- `CONTRIBUTING.md` にこのチェック手順を追加し、PR テンプレートでチェックリスト化する。

作業履歴と注意点:
- このドキュメントは v0.1.3 の作業を受けて作成されました。ルール変更時は `.agent/specs/` と `CHANGELOG.md` を同時に更新してください。
