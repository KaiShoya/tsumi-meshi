# 積み飯 (Tsumi Meshi)

[![Nuxt](https://img.shields.io/badge/Nuxt-4.2.2-00DC82?style=flat&logo=nuxtdotjs)](https://nuxt.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-4.2.1-00DC82?style=flat)](https://ui.nuxt.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat&logo=cloudflare)](https://www.cloudflare.com/)

## 📋 概要

YouTubeやレシピサイトで見つけた気になるレシピを効率的に管理するWebアプリケーションです。フォルダ分け、タグ付け、作ったレシピのチェック機能で、料理のアイデアを整理・追跡できます。

### ✨ 主な機能

- **レシピ管理**: タイトル、URL、説明、画像を保存
- **フォルダ管理**: 階層構造でレシピを整理
- **タグ付け**: 柔軟なタグシステム（新規作成可能）
- **チェック機能**: 作ったレシピを記録・統計表示
- **検索・フィルタ**: タイトル/説明検索、フォルダ/タグフィルタ
- **モバイル対応**: レスポンシブデザイン
- **多言語対応**: 日本語/英語

### 🚀 将来的な機能

- Chrome拡張機能連携（自動レシピ登録）
- 高度な統計・分析
- レシピ共有機能
- 一括操作

## 🛠️ 技術スタック

### Frontend
- **Nuxt 4**: Vue.jsフレームワーク（SSR/SSG対応）
- **TypeScript**: 型安全な開発
- **Nuxt UI**: コンポーネントライブラリ（Tailwind CSSベース）
- **Pinia**: 状態管理

### Backend
- **Cloudflare Workers**: サーバーレスAPI
- **Cloudflare D1**: SQLiteデータベース
- **Cloudflare R2**: 画像ストレージ

### 開発ツール
- **Vitest**: ユニットテスト
- **ESLint**: コード品質チェック
- **Wrangler**: Cloudflare開発ツール

## 🚀 インストール & セットアップ

### 必要条件
- Node.js 18+
- pnpm

### ローカル開発環境の構築

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/KaiShoya/tsumi-meshi.git
   cd tsumi-meshi
   ```

2. **依存関係をインストール**
   ```bash
   pnpm install
   ```

3. **環境変数を設定**
   ```bash
   cp .env.example .env
   # .envファイルを編集して必要な値を設定
   ```

4. **データベースをセットアップ**
   ```bash
   # Cloudflare D1データベースを作成
   npx wrangler d1 create tsumi_meshi_db

   # マイグレーションを実行
   npx wrangler d1 migrations apply tsumi_meshi_db --local
   ```

5. **開発サーバーを起動**
   ```bash
   pnpm dev
   ```

   ブラウザで `http://localhost:3000` にアクセス

### ビルド & デプロイ

```bash
# ビルド
pnpm build

# プレビュー
pnpm preview

# Cloudflare Pagesにデプロイ
npx wrangler pages deploy dist
```

## 📖 使用方法

### 基本操作
1. **レシピの追加**: 「新規レシピ」ボタンからタイトル・URL・説明を入力
2. **整理**: フォルダを作成してレシピを分類
3. **タグ付け**: 既存タグを選択または新規作成
4. **チェック**: 作ったレシピにチェックマークを付ける
5. **検索**: タイトルや説明でレシピを検索

### フォルダ管理
- フォルダは最大3階層まで作成可能
- レシピをドラッグ&ドロップで移動（将来的に）

### 統計機能
- 月間/週間で作ったレシピ数を確認
- タグ別の使用頻度を表示

## 🏗️ アーキテクチャ

```
app/
├── components/          # Vueコンポーネント
├── composables/         # Vue composables
├── pages/              # ページコンポーネント
├── repositories/       # データアクセス層
├── stores/             # Piniaストア
│   ├── data/           # データストア
│   └── pages/          # ページストア
└── utils/              # ユーティリティ

.agent/
├── specs/              # 仕様書
└── docs/               # ドキュメント
```

### 設計原則
- **Clean Architecture**: 層の責務分離
- **Repository Pattern**: データアクセス抽象化
- **Composition API**: Vue 3リアクティブパターン
- **Type Safety**: TypeScriptによる型安全

Note: Frontend network requests should use the centralized API client at `app/utils/api/client.ts` (exported as `apiClient`). `app/repositories/*` contain server-side implementations for Workers/D1 and must not be imported into browser bundles.

## 🤝 開発者向け情報

### 開発ワークフロー
1. Issueを作成（`.agent/docs/tasks/`参照）
2. ブランチを作成: `feature/#123_description`
3. コードを実装・テスト
4. `.agent/specs/`を更新
5. PRを作成・レビュー
6. マージ後、ドキュメント更新

### コーディング規約
- **TypeScript**: strictモード必須
- **Vue**: Composition API推奨
- **コミット**: Conventional Commits
- **テスト**: 機能追加時はテスト必須

### ドキュメント
- `.agent/specs/`: 仕様書（ソースオブトゥルース）
- `.agent/docs/`: 作業ドキュメント・QA
- `copilot-instructions.md`: AI支援ガイドライン

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 貢献

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 連絡先

質問やフィードバックは[GitHub Issues](https://github.com/KaiShoya/tsumi-meshi/issues)までお願いします。

---

**Happy Cooking! 🍳**
