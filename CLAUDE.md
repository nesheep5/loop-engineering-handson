# loop-engineering-handson

ループエンジニアリングのハンズオン教材リポジトリ。教材アプリ（家計簿CLI）は `app/` にある。

## コマンド（すべて app/ ディレクトリで実行）

- `npm test` — テスト実行（vitest）
- `npm run lint` — lint（eslint）
- `npm run typecheck` — 型チェック（tsc）
- `npm run kakeibo -- <コマンド>` — 教材CLIの実行（例: `npm run kakeibo -- summary 2026-07`）

## 規約

- コードコメント・コミットメッセージは日本語で書く
- コミットは1タスク1コミットに分ける
- **`git push` は行わない**（ユーザーから明示的に指示された場合のみ可。ハンズオンの手順に push は含まれない）
