## Agent Onboarding — 要点まとめ

短く：このリポジトリで作業するエージェント／新しいコントリビュータ向けの最小オンボーディングです。

- **目的**: 迅速に貢献できるように、必須ルールとチェックリストをまとめます。
- **重要ファイル**: `.github/copilot-instructions.md`, `.github/agent-documentation-workflow.md`, `.agent/specs/*`, `.agent/docs/*`

**必須ルール（コード変更時）**

1. 変更を加えたら、ローカルで順に実行して必ず結果が通ることを確認してください:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
```

2. 仕様／設計が変わる場合は、対応する `.agent/specs/*` を同一 PR で更新するか、更新不能な場合は `spec-exception` ラベルを付与して対応理由を `.agent/docs/qa/*` に記録してください。

3. PR 作成時は、PR テンプレートのチェックリスト（lint/typecheck/tests/`.agent/specs` 更新）を満たしてください。

**タスク開始前と完了時のワークフロー（追記）**

- **開始前チェック**: タスクを開始する前に必ずタスクリスト（`.agent/docs/tasks/` または `tasks.md`）を確認し、短期の開発計画（作業分割・見積り）を作成してください。
- **不明点とQA更新**: 開始前に不明点を洗い出し、必要な質問や決定事項は `.agent/docs/qa/` に記録して QA リストを更新してください（決定できない場合は `spec-exception` を付与して理由を残す）。
- **完了後の更新**: 作業完了時はタスクリストを完了済みに更新し、仕様や挙動の変更があれば対応する `.agent/specs/*` を同一 PR に含めて更新してください（更新できない場合は QA にエントリを残す）。

- **UI ラッパー実装の注意**: UI ライブラリ（例: NuxtUI）のラッパーを実装する場合、テスト環境やランタイムでライブラリが利用できないケースを考慮して安全なフォールバック（no-op）を用意し、その挙動を `.agent/docs/qa/` に記録してください。

**短いチェックリスト（PR作成前）**
- [ ] `pnpm lint` クリア
- [ ] `pnpm typecheck` クリア
- [ ] `pnpm test -- --run` クリア
- [ ] 関連 `.agent/specs/*` / `.agent/docs/*` を更新（または `spec-exception` を記録）

もし希望があれば、このオンボーディングをさらに短くして `.agent/README.md` に移植します。

---
（自動化や CI の変更は `.github/workflows` を参照し、変更時はチームに通知してください）
