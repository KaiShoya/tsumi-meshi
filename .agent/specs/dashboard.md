# ダッシュボード仕様

## 概要
ユーザー自身の利用状況を可視化するシンプルな統計ダッシュボードを提供する。
管理者専用ではなく、ログインした個人ユーザーが自分のデータだけを閲覧する用途を想定する。

配置: `pages/dashboard.vue`

目的:
- レシピ作成・チェックの履歴把握
- タグの使用状況把握
- 最近のアクティビティ確認

## 表示項目（優先度順）
- カード: 総レシピ数、総チェック数（期間選択可）、アクティブタグ数
- ラインチャート: 日別チェック数（期間: 30/90/365 日）
- 棒グラフ: 上位タグ使用回数（Top 10）
- テーブル: 最近作成されたレシピ（50件まで）

## UI/レイアウト（モック）
- ヘッダー: ページタイトル「ダッシュボード」と期間選択ドロップダウン
- 上段: 3〜4 個の `StatsCard`（数値＋増減）
- 中段左: `ChecksOverTime` ラインチャート（`StatsChart` コンポーネント）
- 中段右: `TopTags` 棒グラフ
- 下段: `RecentRecipes` テーブル

- ヘッダー: ページタイトル「ダッシュボード」と期間選択ドロップダウン
- 上段: 3 個の `StatsCard`（数値＋増減）
  - `総レシピ数` (`summary.totalRecipes`): ユーザーが所有する全レシピ数（期間に依存しない）
  - `総チェック数` (`summary.totalChecks`): 選択した期間（`range`）内のチェック合計
  - `アクティブタグ数` (`summary.activeTags`): 選択した期間内に少なくとも1回使用されたタグの数（＝期間フィルタ適用）
- 中段左: `ChecksOverTime` ラインチャート（`StatsChart` コンポーネント）
- 中段右: `TopTags` 棒グラフ
- 下段: `RecentRecipes` テーブル

注: チャートは `Chart.js`（`vue-chartjs` ラッパー）を利用する。クライアントサイドで描画するが、サーバ側で集計したシンプルな JSON を返す API を用意する。

## API 仕様（案）
エンドポイント: `GET /api/v1/stats`
認証: 必須（ログインユーザーのスコープ）
クエリパラメータ:
- `range` (optional): `30d` (default) | `90d` | `365d`

Summary フィールド定義:
- `summary.totalRecipes`: ユーザーが所有する全レシピ数（期間非依存）
- `summary.totalChecks`: 選択した `range` 内のチェック合計
- `summary.activeTags`: 選択した `range` 内に少なくとも1回使用されたタグの数（= 期間フィルタ適用）

レスポンス例 (200):
```
{
  "summary": {
    "totalRecipes": 123,
    "totalChecks": 456,
    "activeTags": 34
  },
  "checksOverTime": [
    {"date": "2025-11-17", "count": 3},
    {"date": "2025-11-18", "count": 5}
  ],
  "topTags": [
    {"tag": "和食", "count": 45},
    {"tag": "時短", "count": 30}
  ],
  "recentRecipes": [
    {"id": 123, "title": "カレー", "createdAt": "2025-12-10"}
  ]
}
```

## 実装ノート
- フロントエンド: `app/components/StatsChart.vue`, `StatsCard.vue`, `RecentRecipes.vue` を作成する。`vue-chartjs` を使い Chart.js のレスポンシブ設定を有効にする。
 - ストア/Repository: フロントエンドは `stores/pages/dashboard.ts`（UI 状態：期間選択・読み込み状態）。
   API 呼び出しは `apiClient.getDashboardStats()` 経由で行う（`repositories/stats.ts` は型定義のみを提供）。
- バックエンド: 単純な集計クエリで上記 JSON を返す。負荷を考慮して Workers 側に定期集計バッチを用意する選択肢を残す。

## アクセシビリティ
- Canvas ベースのチャートは視覚的に見えないユーザーのために代替データ表を提供する。`role="img"` と `aria-label` を付与し、チャート下にデータテーブル（スクリーンリーダーで読みやすい）を置く。
- カードやコントロールはキーボード操作可能にする。

## 受け入れ基準
1. `pages/dashboard.vue` に遷移するとログイン済みユーザーのダッシュボードが表示される。
2. `GET /api/v1/stats?range=30d` を呼ぶと上記 JSON を返し、チャートが描画される。
3. レスポンシブで表示が崩れないこと（モバイル: チャート縦積み）。
4. a11y テストが追加されていること（`tests/a11y/dashboard.a11y.spec.ts`）。

## 次のステップ
1. フロントエンドのモック実装（PoC）を作成して UI/UX を実際に確認する。
2. API の最小実装（サンプルデータ）を追加して PoC と連携する。
3. 依存追加と lint/typecheck/test の実行。
