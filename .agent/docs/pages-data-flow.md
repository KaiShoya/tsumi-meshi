# Pages Data Flow — データ取得とリダイレクト条件

この文書は、アプリ内の主要ページがどのタイミングで API を呼び出すか、またどの条件でリダイレクトや空状態処理を行うかをまとめたものです。

※ 実装ファイルは主に `app/pages`、`app/layouts/default.vue`、`app/composables/useAuth.ts`、`app/stores`、`app/utils/api/client.ts` を参照してください。

---

## 共通（認証）
- 初期化: `useAuth().initAuth()` が `apiClient.getCurrentUser()`（`/auth/me`）を呼ぶ。
- 判定: `useAuth().isAuthenticated`（`user` が存在するか）でログイン状態を判定。
- ログイン／登録後: `apiClient.login/register()` 実行後に `initAuth()` を呼び、成功したら `navigateTo('/')` でホームへ遷移する。
- 実装: `app/composables/useAuth.ts`

## レイアウト（グローバルガード）
- ファイル: `app/layouts/default.vue`
- タイミング: `onMounted` で `initAuth()` を呼ぶ。
- リダイレクト条件: `isAuthenticated` が `false` かつ現在ルートが `/auth/login` でない場合に `navigateTo('/auth/login')`。
- 備考: 未認証ユーザーをほぼ全画面でログイン画面へ誘導する仕組み。

## ログイン画面
- ファイル: `app/pages/auth/login.vue`
- API 呼出し: フォーム送信で `useAuth().login(email, password)` → `apiClient.login()` → `initAuth()`（`/auth/me` を再取得）。
- リダイレクト条件:
  - `onMounted` で `isAuthenticated` が true の場合は `navigateTo('/')`（既にログイン済みのアクセスを防止）
  - ログイン成功後は `useAuth.login` 内でトップへ遷移
- 失敗時: エラーメッセージ表示

## 登録画面
- ファイル: `app/pages/auth/register.vue`
- API 呼出し: `useAuth().register()` → `apiClient.register()` → `initAuth()`。
- リダイレクト条件: 登録成功後はトップへ遷移。未ログイン専用ページとして扱う。

## ホーム（レシピ一覧）
- ファイル: `app/pages/index.vue`
- API 呼出しタイミング:
  - `onMounted` で `initAuth()`（認証確認）を呼ぶ（実装上、呼び出し後に `isAuthenticated` を確認してリダイレクト判定を行う）。
  - 認証が確認できれば `recipesStore.fetchRecipes()`（`apiClient.getRecipes()`）を呼ぶ。
  - タグ/フォルダは `apiClient.getTags()` / `apiClient.getFolders()` を `onMounted` で取得して `tagOptions` / `folderOptions` を構築。
  - 検索・フィルタはユーザー操作（入力のデバウンスやセレクト変更）時に `searchRecipes` / `fetchRecipes({ ... })` を呼ぶ。
- リダイレクト条件: `isAuthenticated` が false の場合は `/auth/login` へ遷移。
- 空データ処理: レシピが空 → Empty State 表示。タグ/フォルダ取得失敗時はトースト表示。

## レシピ詳細（/recipes/:id）
- ファイル: `app/pages/recipes/[id]/index.vue`
- API 呼出し: `onMounted` で `$fetch('/api/recipes/:id')` を呼び `recipe` に格納。
- 空データ処理: `recipe` が null の場合は詳細部分が空になる（ローディング→空表示）。現状は 404 リダイレクトは未実装。

## レシピ編集
- ファイル: `app/pages/recipes/[id]/edit.vue`
- API 呼出し: `onMounted` で `$fetch('/api/recipes/:id')` してフォーム初期値を埋める。送信時は `PUT /api/recipes/:id`。
- 空データ処理: 取得失敗なら編集 UI は表示されない（`loaded` フラグで切替）。

## レシピ作成
- ファイル: `app/pages/recipes/create.vue`
- API 呼出し: 送信時に `apiClient.createRecipe()` を呼ぶ。成功時は `router.push('/')`。

## フォルダ一覧
- ファイル: `app/pages/folders/index.vue`
- API 呼出し: `onMounted` で `pageStore.fetchFolders()` → `foldersStore.fetchFolders()`（`apiClient.getFolders()`）。
- 空データ処理: `rootFolders.length === 0` なら「フォルダがありません」表示。操作失敗はトースト表示。

## タグ一覧
- ファイル: `app/pages/tags/index.vue`
- API 呼出し: `onMounted` で `pageStore.fetchTags()` → `tagsStore.fetchTags()`（`apiClient.getTags()`）。
- 空データ処理: 空配列ならリストは空。作成 UI は残る。

## チェック／統計画面
- ファイル: `app/pages/checks/index.vue`
- API 呼出し: `onMounted` で `checksPage.fetchStats()`（`apiClient.getCheckStats()`）。
- 空データ処理: 失敗時はデフォルト `{ totalChecks: 0, periodChecks: 0 }` を返す。

## API クライアントの共通挙動
- ファイル: `app/utils/api/client.ts`
- すべてのリクエストは `apiClient` 経由で行われ、`credentials: 'include'` を付けて Cookie を送受信する（認証はサーバーの HttpOnly cookie に依存）。
- 非 2xx は例外として投げられるため、呼び出し側でトーストやエラーハンドリングを行う。

---

### 改善提案（任意）
- `app/pages/index.vue` の `initAuth()` と `isAuthenticated` 判定の待ち合わせをより明確にして、認証チェック完了前の早期リダイレクトを防止する（例: `await initAuth()` の完了を保証してから判定）。
- 各詳細ページで `recipe` / `folder` が見つからない場合に 404 ページへの明示的なリダイレクトを追加する。
- ドキュメント化済みの挙動に基づく簡単な E2E テスト（ログイン→遷移、未ログイン→ログイン画面、404 挙動）を追加する。

---

作成者: 自動要約エージェント
作成日: 2025-12-17
