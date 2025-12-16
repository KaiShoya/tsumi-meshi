# .agent — 運用概要とクイックスタート

このディレクトリは、アプリの仕様・設計（specs）と運用・検討資料（docs）を体系的に管理するための領域です。チームの「単一の運用ソース」として扱います。

## 目的
- 仕様の単一ソース（SoT）化により、コードとドキュメントの乖離を防止。
- コード変更時に関連ドキュメントを必ず同期更新する文化を明確化。
- バージョン別のタスク運用で進捗とリリース準備を可視化。

## 構成
```
.agent/
├── specs/               # 仕様・設計の確定版（ソース・オブ・トゥルース）
│   └── ci-and-dependencies.md  # CI・パッケージ管理に関する運用ルール
├── docs/
│   ├── qa.md                # Q&A と設計決定ログ
│   ├── tasks.md             # リリース時のみ更新する統一インデックス
│   ├── backlog-tasks.md     # バージョン未決定タスク & ロードマップ
│   ├── tasks/               # マイナーバージョン別タスク（開発中に随時更新）
│   ├── qa/                  # 開発中のQ&A / 決定事項（バージョン別）
│   ├── qa-archive/          # 完了・アーカイブ済みのQ&A（参照用）
│   └── task-archive/        # 完了済みバージョンの保管
└── README.md                # この説明書
```

## クイックスタート
1. 仕様・設計を追加/変更する場合は `.agent/specs/` を編集。
2. Q&A や設計決定は `.agent/docs/qa.md` に記録。
3. 開発タスクは `.agent/docs/tasks/vX.Y-tasks.md` で管理（X.Y はマイナーバージョン）。
4. バージョン未決定のタスクは `.agent/docs/backlog-tasks.md` に記載。
5. コード修正・追加・削除時は、関連する specs/docs を同一 PR で同期更新。

## タスク運用の基本
- マイナーバージョン毎にタスクを管理（パッチバージョン単位では分割しない）
- 追加時は `title`, `area`, `owner`, `created` を必ず記載。
- ステータスは `- [ ]` / `- [x]` で管理。完了時に `completed`, `pr`, `commit` を追記。
- バージョンは Semantic Versioning（`X.Y.Z` 形式）だが、タスク管理は `X.Y` 単位。
- リリース時は `package.json` の `version` 同期、Git タグ、Release Notes、`task-archive/` へ移動を実施。

## PR チェックリスト
- 仕様変更は `.agent/specs/` へ反映済みか。
- Q&A や決定事項は `.agent/docs/qa.md` に記録済みか。
- タスクに Issue/PR/Commit のリンクを記載したか。
- PR 本文に「ドキュメント更新」セクションを含めたか。

## 強制ルール（自動化）
- **ルール**: コードの変更は必ず関連する `specs` / `docs` / `tasks` を同一 PR で更新すること。
- もし更新できない場合は、PR に `spec-exception` ラベルを付け、`.agent/docs/qa.md` に理由と次のアクションを記載すること。
- CI ワークフローにより PR がコード変更を含むと自動検出された場合、対応する `specs`/`docs` の差分がなければ CI が失敗（または警告）します。

### アーカイブ注意事項

- `.agent/docs/qa-archive/` は過去バージョンのQ&Aと決定事項を保管するための参照用ディレクトリです。
- アーカイブ操作（ファイルの移動・削除・リネーム）は必ず変更差分を確認し、`.agent/docs/qa/` や `tasks/` のインデックスを同時に更新してください。
- 自動化エージェント（Copilot/Agents）はアーカイブ操作を実行する前に、ステージされた変更一覧を提示してユーザーの明示的な承認を得ること。

## 参照
- プロジェクト固有の詳細ガイド: [`.github/copilot-instructions.md`](../.github/copilot-instructions.md)
- 運用フロー詳細: [`.github/agent-documentation-workflow.md`](../.github/agent-documentation-workflow.md)
