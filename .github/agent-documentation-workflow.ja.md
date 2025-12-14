# 📋 ドキュメント & タスク管理

## ディレクトリ構成

このプロジェクトは `.agent/` ディレクトリを使用してドキュメント管理を行います：

```
.agent/
  ├── specs/                  # 仕様・設計の単一ソース（SoT）
  ├── docs/
  │   ├── qa-index.md         # QA インデックス（リリース時に更新）
  │   ├── tasks.md            # タスクリストインデックス（リリース時に更新）
  │   ├── qa/                 # バージョン別 QA
  │   ├── tasks/              # バージョン別タスクリスト
  │   ├── qa-archive/         # 完了済み QA バージョン
  │   ├── task-archive/       # 完了済みタスク バージョン
  │   └── backlog-tasks.md    # バックログ & ロードマップ
  └── README.md               # 概要とクイックスタート
```

**重要**: `.agent/` ディレクトリが存在しない場合は、必要に応じて自動的に作成してください。

## 📝 ドキュメントガイドライン

### コア原則

- **信頼できる唯一の情報源**: `.agent/specs/` の仕様・設計はコード変更時に必ず同期更新
- **責務の分離**:
  - `.agent/specs/` — 確定版仕様とアーキテクチャ設計
  - `.agent/docs/` — 検討・Q&A・タスク追跡・ロードマップ
- **同期更新**: コード変更とドキュメント更新は同一 PR に含める
- **プロジェクト固有ルール**: 言語・フレームワーク固有の詳細は `copilot-instructions.md` に記載

### `.agent/docs/` - 作業ドキュメント

このディレクトリで管理するドキュメント：

#### **QA_AND_DECISIONS.md** - Q&A と設計決定ログ
- 形式: `## [カテゴリ] 質問タイトル`
  - カテゴリ例: `[API]`, `[UI]`, `[アーキテクチャ]`, `[テスト]`, `[データベース]` など
- 推奨フォーマット:
  ```markdown
  ## [カテゴリ] 質問タイトル
  
  **Question**: 質問の詳細説明
  
  **Answer**: 回答と根拠
  
  **Decided on**: YYYY-MM-DD
  **Related**: #issue_number（該当する場合）
  ```
- 目的: 設計決定とアーキテクチャの議論を記録し、将来の参照用として保管

**QA ファイル分割ルール（v1.20 より採用）**:

QA リストはコンフリクト防止のため、バージョン毎に分割。tasks.md と同じ構造を採用。

**ディレクトリ構成**:
```
.agent/docs/
├── qa-index.md              ← インデックス（tasks.md 相当）
├── QA_AND_DECISIONS.md      ← レガシー（v1.19 以前用）
└── qa/
    ├── v1.20-qa.md          ← v1.20 開発中の Q&A・決定
    ├── v1.21-qa.md          ← v1.21 の Q&A（予定）
    ├── v1.22-qa.md          ← v1.22 の Q&A（TBD）
    ├── qa-backlog.md        ← バージョン非依存の長期 Q&A
    └── qa-archive/
        ├── v1.19-qa.md      （完了済み）
        └── ...
```

**開発中**:
1. 新規 QA 発生時 → 対応バージョンの `qa/vX.Y-qa.md` に記載
2. 形式: `## [カテゴリ] Issue #XXX: 質問タイトル`
3. GitHub Issues のコメントでの議論と連携
4. 複数バージョンに跨る場合 → v1.20 に記載し、他から参照リンク

**リリース時**:
1. 該当バージョンの `qa/vX.Y-qa.md` を確定
2. 完了済み QA を `qa-archive/vX.Y-qa.md` へ移動（オプション）
3. `qa-index.md` を更新
4. 決定済み QA は `.agent/specs/` に統合

**GitHub Issues との同期ルール**:
1. 開発中に不明点・QA が発生 → GitHub Issue をコメント追加（or 新規作成）
2. タスク定義・仕様に更新が発生 → 関連 Issue にコメント追加
3. 不明点のやり取り・議論 → すべて GitHub Issue に記録
4. 決定事項 → QA ファイルに記載（関連 Issue をリンク）

**フロー**:
```
開発中の疑問
    ↓
GitHub Issue にコメント（質問と背景）
    ↓
ユーザーからのフィードバック / 決定
    ↓
Issue に記録 + QA ファイルに追記
    ↓
タスクリスト更新（タスク番号をリンク）
```

#### **tasks/ ディレクトリ** - バージョン別タスクリスト
- 形式: 各 **マイナーバージョン** に対して `tasks/vX.Y-tasks.md` を作成（パッチバージョンでは分割しない）
- フィールド: `title`, `area`, `owner`（オプション）, `created`（YYYY-MM-DD）, ステータス（`- [ ]` / `- [x]`）
- タスク完了時に追加: `completed`, `pr`（URL）, `commit`（SHA）
- リリース時: 完了したバージョンを `task-archive/` に移動、`tasks.md`（インデックス）を更新

#### **tasks.md** - 全バージョンのインデックス
- リリース時のみ更新
- 全アクティブバージョンとアーカイブバージョンのファイルをリスト
- 現在開発中のバージョンの素早い参照を提供

#### **backlog-tasks.md** - バックログ & ロードマップ
- 対応バージョンが未決定のタスク
- 将来のリリース計画（v1.21, v1.22, v2.0 等）
- 長期検討事項と Issue 統計情報

#### **task-archive/** - 完了済みバージョン
- 完了したバージョンのタスクファイルを保管
- オプション: `vX.Y-tasks-completed.md` として完了タスクのサマリーを作成

### `.agent/specs/` - 仕様（信頼できる情報源）

このディレクトリには、システムの**現在の状態**を表す確定済みの仕様が含まれます。

**対象範囲**: アーキテクチャ、API設計、データモデル、ビジネスロジック、システム全体の仕様。

**対象外**: コンポーネント単位や画面単位の仕様は、コンポーネントファイル内のカスタム `<spec>` ブロックで管理します。

**重要なルール**: コードを変更した場合、`.agent/specs/` も**必ず**更新してください。

#### 利用可能な仕様書

- **`architecture.md`**: システム全体アーキテクチャ、技術スタック、各層の責務
  - **参照タイミング**: 新機能追加、新しい composable/store/repository 作成時
  - **キー情報**: ディレクトリ構造、設計パターン、タイムゾーン処理、i18n 戦略

- **`data-model.md`**: Cloudflare D1/KV スキーマ、テーブル定義、アクセスポリシー、マイグレーション
  - **参照タイミング**: データベース操作、型定義の確認、スキーマ変更計画時
  - **キー情報**: テーブル（recipesなど）、外部キー、インデックス

- **`repository-api.md`**: Repository パターン実装、CRUD API、エラーハンドリング戦略
  - **参照タイミング**: `store/data/` ストア実装、データアクセス方法確認時
  - **キー情報**: 4リポジトリ（Drinks, DrinkLabels, DrinkCounters, UserSettings）、メソッド仕様、エラー処理

- **`state-management.md`**: Pinia ストア設計、グローバル/データ層/プレゼンテーション層の責務
  - **参照タイミング**: ストア実装、状態管理戦略確認時
  - **キー情報**: Store レイアウト（3層構造）、`storeToRefs()` 使用方法、トーストメッセージタイミング

- **`features.md`**: ユーザー機能仕様、ページ構成、UI フロー、クロスカッティング機能
  - **参照タイミング**: 新ページ追加、ユーザーフロー確認、機能要件理解時
  - **キー情報**: 8ページ仕様（ログイン、ホーム、飲み物管理、ラベル管理、データ分析、設定）、認証フロー、エラー処理フロー

## 🔄 ワークフロー

### チャットでのやり取り中

1. **要件を明確化**: 会話内で Q&A を通じて要件を詰める
2. **決定事項を記録**: 区切りの良いタイミングで `.agent/docs/` に記録
3. **仕様を更新**: 決定事項が確定したら `.agent/specs/` を更新
4. **GitHub Issues にリンク**: タスク追跡のために Issue と紐付け

### コードを変更する場合

**必ずこの順序に従ってください**:

1. ✅ コード変更を実装
2. ✅ 関連する `.agent/specs/` ファイルを更新
3. ✅ コミットメッセージに仕様更新を記載
4. ✅ （PR の場合）PR の説明に仕様変更を含める

**コミットメッセージの例**:
```
feat: 日付範囲によるドリンクフィルタリングを追加

- DrinksRepository にフィルタロジックを実装
- UI コンポーネントを更新
- .agent/specs/drinks-api.md に新しいエンドポイントを追加
```

## 🏗️ 実装ガイドライン

### Store 実装パターン

**責務分離**: Data Stores と Page Stores を厳格に分離

#### Data Stores（`store/data/`）
```ts
// 単純な CRUD + リポジトリ呼び出し
const fetchDrinks = async () => {
  try {
    drinks.value = await $drinksRepository.fetchAll()
  } catch (error) {
    // 単に再スロー（トーストなし）
    throw error
  }
}

// 状態は readonly で公開
return {
  drinks: readonly(drinks),
  fetchDrinks,
}
```

**ルール**:
- ✅ リポジトリを直接呼び出し
- ✅ エラーはそのまま再スロー
- ✅ トーストメッセージは表示しない
- ✅ 状態は `readonly()` で公開
- ❌ 複数ストアの組み合わせなし
- ❌ ビジネスロジック・集約なし

#### Page Stores（`store/pages/`）
```ts
// 複数の data store + エラー処理 + トースト表示
const fetchData = async () => {
  try {
    showLoading()
    await drinksStore.fetchDrinks()
    // データ集約・変換処理
  } catch (error) {
    if (error instanceof CustomError) {
      showDangerToast(error.getMessage())
    }
    logger.error('Failed to fetch', { module: 'indexStore' }, error)
  } finally {
    hideLoading()
  }
}
```

**ルール**:
- ✅ 複数のデータストアを組み合わせ
- ✅ エラーをキャッチしてトーストを表示
- ✅ 集約・変換ロジックを実装
- ✅ ログレコーディングを実施
- ✅ ローディング状態を管理
- ❌ リポジトリの直接呼び出しなし
- ❌ エラー処理なしの再スロー

### エラーハンドリング階層図

```
Component
    ↓ (store action 呼び出し)
Page Store ← トーストを表示、ログ記録
    ↓ (data store 呼び出し)
Data Store ← 単に再スロー
    ↓ (repository 呼び出し)
Repository ← CustomError をスロー
    ↓
Cloudflare API
```

**各層の責務**:

1. **Repository** (`app/utils/api/`)
   - Cloudflare API エラーをキャッチ
   - `CustomError` に変換してスロー
   - メッセージは実装者向け（英語）

2. **Data Store** (`store/data/`)
   - エラーを単に再スロー
   - 処理なし（Page Store に任せる）

3. **Page Store** (`store/pages/`)
   - エラーをキャッチ
   - `showDangerToast()` でユーザーに通知
   - `logger.error()` でログ記録
   - 必要に応じて UI 状態をリセット

4. **Component** (`app/components/`)
   - Page Store action を呼び出し
   - ストア経由でユーザーに通知
   - 直接的なエラー処理は不要

**トースト種類**:
```ts
showSuccessToast('操作が成功しました')        // 緑
showInfoToast('確認メッセージです')           // 青
showWarningToast('注意が必要です')            // 黄
showDangerToast('エラーが発生しました')       // 赤
```

**例**: 飲み物削除
```ts
// Page Store: deleteAction
const deleteDrink = async (id: number, name: string) => {
  try {
    showLoading()
    await drinksStore.deleteDrink(id)
    showSuccessToast(
      t(LOCALE_DRINKS_DELETE_SUCCESS, { name })
    )
    await fetchDrinks()  // リロード
  } catch (error) {
    if (error instanceof CustomError) {
      showDangerToast(error.getMessage())
    }
    logger.error('Failed to delete drink', 
      { module: 'drinksStore', drinkId: id }, 
      error
    )
  } finally {
    hideLoading()
  }
}
```

### PR レビューチェックリスト

PR を作成またはレビューする際は、以下を確認してください:

- [ ] コード変更が実装されている
- [ ] テストが追加/更新されている
- [ ] 仕様が変更された場合、`.agent/specs/` が更新されている
- [ ] 関連する GitHub Issues がリンクされている
- [ ] 必要に応じて `.agent/docs/` のドキュメントが更新されている

## 🤖 Copilot の動作

### 仕様更新の自動提案

仕様に影響するコード変更を検出した場合:

1. **積極的に提案**: 仕様更新を自動的に提案
2. **差分を表示**: 更新が必要な内容の差分を表示
3. **確認を求める**: 更新前に確認を求める

**提案の例**:
```
コードを変更しました。以下の仕様ファイルも更新が必要です:

.agent/specs/drinks-api.md:
- [ ] 新しい `filterByDateRange` パラメータを追加
- [ ] レスポンススキーマを更新

更新しますか?
```

### PR 作成サポート

コード変更が PR の準備ができた場合:

1. **チェック**: `.agent/specs/` の更新が必要かどうか確認
2. **PR 説明文を生成**: 以下を含める
   - 変更内容のサマリー
   - 関連する仕様へのリンク
   - レビュアー用のチェックリスト
3. **検証**: GitHub Issue のリンクを確認

### ドキュメントメンテナンス

- **自動検出**: `.agent/docs/` 内の未解決の質問が議論で解決された場合に検出
- **移動を提案**: 解決済みの項目を `.agent/specs/` に移動することを提案
- **整理**: QA リストをカテゴリ別に整理された状態に保つ

## 📌 GitHub Issues との連携

- `.agent/docs/` のタスクは GitHub Issues を参照: `#123`
- 一貫性のために GitHub Issue テンプレートを使用
- タスク完了時に Issue のステータスを更新
- PR を Issue に自動的にリンク: `Closes #123`

## 🎯 ベストプラクティス

1. **信頼できる唯一の情報源**: `.agent/specs/` は常に最新の状態に保つ
2. **「どのように」ではなく「なぜ」を記録**: 根拠とコンテキストに焦点を当てる
3. **ドキュメントは軽量に**: 情報の重複を避ける
4. **コピーせずリンク**: 可能な限り既存のドキュメントを参照
5. **バージョンコンテキスト**: トレーサビリティのために日付と Issue 番号を含める

## 🚨 よくある間違い

- ❌ 仕様を更新せずにコードを更新する
- ❌ 実装なしで仕様を作成する
- ❌ 複数のファイルに情報を重複させる
- ❌ GitHub Issues へのリンクを忘れる
- ❌ 解決済みの質問を `.agent/docs/` に無期限に残す

---

## 🚀 セットアップ & 採用ガイド

このドキュメント運用を採用するプロジェクト向け：

1. **ディレクトリ構造を作成**: `.agent/specs/` と `.agent/docs/` のディレクトリを作成
2. **仕様を初期化**: アーキテクチャと設計の初期仕様ファイルを作成
3. **タスク追跡を開始**: `tasks.md` インデックスとバージョン別タスクリストでスタート
4. **PR ポリシーを確立**: コード変更と共にドキュメント更新を必須化
5. **プロジェクトルールを参照**: 言語・フレームワーク固有の詳細は `copilot-instructions.md` を参照

詳細は [agent-operations.md](../../.github/agent-operations.md) を参照（汎用的で他プロジェクトへ転用可能なコアルール）。
