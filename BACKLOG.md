# kakeibo バックログ

このファイルはループの**外部状態（external state）**。
エージェントはここからタスクを発見し、完了したらチェック `[x]` と完了メモを記録する。

## 運用ルール

- タスクは上から順に優先度が高い
- 1回の実行で着手するタスクは**1つだけ**
- 完了条件: 実装済み・テスト追加済み・`npm test` / `npm run lint` / `npm run typecheck` がすべて成功・SPEC.md に適合
- 完了したら `[x]` にして、行末に完了メモ（何をしたか1行）を追記する
- 着手したが完了できなかった場合は、タスクの下にインデントして状況をメモする

## タスク

- [x] `format.ts` の `formatYen` と `formatExpenseRow` にユニットテストを追加する（`toCsv` のテストは下の CSV バグ修正タスクで一緒に追加するため、ここでは対象外） — tests/format.test.ts を追加（formatYen 4件・formatExpenseRow 3件）、test/lint/typecheck 全通過
- [x] `delete` コマンドを実装する（SPEC.md の削除仕様に従うこと） — 論理削除（deleted:true 付与）で実装、list/summary/budget/export は filterActive で除外、存在しないID・削除済み再削除はエラー終了、store/summary にテスト追加、test/lint/typecheck 全通過
- [x] バグ修正: `export` で出力する CSV は、メモにカンマが含まれると列がずれる。SPEC.md の CSV 出力仕様に従って修正し、再発防止のテストを追加する — toCsv を RFC 4180 準拠に修正（カンマ・改行・ダブルクォートを含むフィールドは "" で囲みエスケープ）、format.test.ts に toCsv テスト7件を追加、test/lint/typecheck 全通過
- [x] `top` コマンドを実装する: `top <YYYY-MM>` で、その月の支出額上位3カテゴリを金額の大きい順に表示する — summary に topCategories（金額降順・同額はカテゴリ名昇順で安定）を追加、cli に top ケースを追加（削除済み除外・月未指定はエラー終了）、summary.test.ts にテスト5件追加、test/lint/typecheck 全通過
- [ ] 入力バリデーション: `add` コマンドの日付が `YYYY-MM-DD` 形式でない場合はエラーにする（SPEC.md のデータ仕様を参照）
- [ ] `budget` コマンドで予算未設定のカテゴリに支出がある場合、「予算未設定」として一覧の末尾に表示する
