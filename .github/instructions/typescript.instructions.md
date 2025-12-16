## TypeScript / Copilot 向けコーディングルール

目的: リポジトリ固有の型・スタイル・テストに関する注意点を Copilot (自動補完/生成) に伝え、Lint/Typecheck/Tests を通すコードを生成させる。

参照: 既存のルール・自動生成設定を流用してください。
- プロジェクト共通 Copilot 指示: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- ESLint 設定: [.nuxt/eslint.config.mjs](.nuxt/eslint.config.mjs)

基本方針
- このリポジトリの `pnpm lint` / `pnpm typecheck` / `pnpm test` が通るコードを生成すること。
- 既存のスタイル設定 (ESLint / stylistic) に従うこと。自動整形ではなくルール準拠の出力を優先する。

重要ルール（まとめ）
- 明示的な `any` を避ける: テストや API レスポンスに対しては `unknown` を使い、可能なら具体的な `interface` / `type` を定義して返す。
- API レスポンスは具体型で返す: `apiClient` 等のメソッドの戻り型は `unknown[]` や `any` ではなく、可能な限り形状 (`{ id: number; title: string; createdAt: string }` 等) を明記する。
- テスト互換性:
  - テスト環境では Nuxt の `$fetch` がスタブされることがあるため、テスト時に `$fetch` を優先利用するラッパー実装がある。生成するコードは `globalThis.$fetch` の存在を壊さないように呼び出すか、既存の `apiClient` を使うこと。
  - 同一オリジンの API 呼び出しを期待するテスト (`/api/...`) があるため、`apiClient` の base URL は環境(テスト/開発/Cloudflare)に応じて正しく扱うこと。
- 不要な try/catch は避ける: 内側で例外を単に再投げするだけの `try { ... } catch(e) { throw e }` は削除する。
- ロガー呼び出しはガードする: `useLogger` 等の import が失敗してもフォールバックできるように `try` で囲むか存在チェックを行う。
- タイプリテラルの区切りはプロジェクトの stylistic 設定に合わせる: メンバー区切り (comma/semicolon 等) は ESLint 設定に従う。生成コードは既存ファイルのスタイルに合わせてください。

スタイル / 型の詳細
- 配列の要素型は具体化する: `Array<unknown>` より `Array<{ date: string; count: number }>` のように定義する。
- 小さな inline 型が複雑になる場合は `interface`/`type` を抽出して用いる（可読性と再利用性向上）。

例: 正しい `apiClient` 型例
```
async getDashboardStats(range = '30d') {
  return this.request<DashboardStats>(`/stats?range=${encodeURIComponent(range)}`)
}

interface DashboardStats {
  summary: { totalRecipes: number; totalChecks: number; activeTags: number };
  checksOverTime: Array<{ date: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  recentRecipes: Array<{ id: number; title: string; createdAt: string }>;
}
```

テストでの注意点
- テストは `vi.stubGlobal('$fetch', ...)` を使って API 呼び出しをモックしている箇所がある。生成コードは `$fetch` の置き換えを阻害しないこと。
- Node 環境の `fetch` 実装に依存する箇所（URL の構築など）は `new URL(...)` に渡される値が必ず有効な完全 URL か、テスト時には `/api/...` 等の同一オリジンパスになるように注意する。

チェック手順（開発者向け）
1. `pnpm lint` で ESLint を実行
2. `pnpm typecheck` で型チェック
3. `pnpm test` でテストを実行

もし Copilot による生成で上記チェックを通せない場合は、生成後に手動で型を明記し、`any` を `unknown` に置き換え、`interface` を追加してください。

参考/リンク
- プロジェクト Copilot 指示: `.github/copilot-instructions.md`
- ESLint 設定（stylistic ルール等）: `.nuxt/eslint.config.mjs`
- 主要ファイルの実例: `app/utils/api/client.ts`, `app/composables/useAuth.ts`

このファイルは生成支援のための補助ルールです。具体的な修正は PR ごとに `pnpm lint` / `pnpm typecheck` を回して確認してください。
