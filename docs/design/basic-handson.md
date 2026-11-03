# ループエンジニアリング・ハンズオン 設計書

作成日: 2026-07-18

## 背景と目的

Addy Osmani のエッセイ [Loop Engineering](https://addyosmani.com/blog/loop-engineering/)（2026年6月）は、コーディングエージェントとの関わり方を「プロンプトを打つ」から「エージェントにプロンプトを打つループを設計する」へ転換すべきだと説いた。Peter Steinberger の一文「You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents.」で広く知られる。

本ハンズオンは、このループエンジニアリングのエッセンスを体験学習として提供する。

- **対象者**: 開発経験があり、Claude Code を日常業務で利用しているエンジニア（Claude Code の基本操作説明は含めない）
- **用途**: リポジトリを clone すれば一人で進められる自習教材として公開する
- **ツール前提**: Claude Code
- **公開ポリシー**: 個人情報・会社情報・ローカルパス等を一切含めない。サンプルデータはすべて架空

## 学習設計の方針: 痛み駆動の進化ストーリー

機能カタログ的に要素を並べるのではなく、各ステップで「手動運用の痛み」を先に体験させ、それを解消する形でループの構成要素を導入する。

各ステップは同じ型で進む:

1. **痛みを体験する** — 意図的に非効率なやり方で作業する
2. **コンセプトを知る** — エッセイの該当概念を短く解説
3. **ループを設計して解消する** — 実際に手を動かす演習
4. **チェックポイント** — 何が変わったかを振り返る

## 教材アプリ: 欠陥入り家計簿 CLI「kakeibo」

- TypeScript / Node 製の小さな CLI ＋純粋関数ライブラリ。支出の記録・集計・予算チェックができる
- サーバ不要で `npm install` だけで開始できる。ドメインが自明なため題材理解に時間を使わせない
- vitest ＋ eslint ＋ TypeScript strict を検証手段として同梱
- 欠陥はステップごとに役割を持たせて仕込む:
  - **Step0-1 用**: 落ちるテストを伴うバグ数件（境界値ミス、日付処理バグ等）
  - **Step2 用**: BACKLOG.md に未実装機能・テスト未整備のバグ報告
  - **Step3 用**: 「一見動くが SPEC.md 違反」に陥りやすいタスク（実装エージェントの自己採点の甘さを体験させる仕掛け）
  - その他: lint 違反・TODO コメントを散らす

## ステップ構成

| Step | 痛み | 導入する要素 |
|------|------|------------|
| 0 | セットアップ＋ワンショット指示のチャット往復 | （痛み体験のみ） |
| 1 | 毎回自分で結果確認するのが辛い | 検証ループ: ゴール＋検証コマンドを与え、テストが通るまで自己修正させる |
| 2 | セッションが変わると忘れる | 外部状態: BACKLOG.md から仕事を発見し、完了を記録させる |
| 3 | 本人に採点させると甘い | Subagent 検証分離: reviewer subagent が SPEC.md と照合する |
| 4 | 毎回自分で起動するのが辛い | 自動化: /loop で「タスク選択→実装→検証→レビュー→記録」を回し、人間はトリアージ役に |
| 終章 | — | 人間の役割の考察（検証責任・理解負債・cognitive surrender）＋発展編紹介 |

発展編（docs/advanced.md、紹介のみ）: Worktrees（並行隔離）/ Skills（知識のコード化）/ cron・スケジュール実行 / MCP コネクタ

## リポジトリ構成

```
README.md              # ハンズオンの入口・全体マップ・前提条件
docs/
  basic/step0.md〜step4.md   # 各ステップの手順書
  basic/answers.md          # 仕込んだ欠陥の一覧（講師・答え合わせ用）
  advanced.md               # 発展編
app/                   # 教材アプリ（欠陥入り家計簿CLI）
  src/  tests/  package.json  tsconfig.json  eslint 設定
SPEC.md                # アプリ仕様（Step3 のレビュー基準）
BACKLOG.md             # Step2〜4 でループが読む外部状態
.claude/agents/reviewer.md  # Step3 で使う reviewer subagent 定義
```

## 検証方法

- `cd app && npm install && npm test` で Step0 想定の失敗テストが意図通り落ちること
- `npm run lint` で仕込んだ lint 違反が検出されること
- 各ステップの手順書のプロンプトを Claude Code で実際に実行し、痛み→解消の体験が成立すること

## 追記（初版実装後の変更）

- 概念解説 `docs/what-is-loop-engineering.md` と実践パターン集 `docs/practices.md` を追加
  （参考文献は著者の実績・評判で選定し、Zenn / Qiita は除外する方針）
- エージェント向けの基本情報として `CLAUDE.md` を追加（罠保護のため SPEC / BACKLOG には触れない）
- README と手順書から所要時間の表記を削除
- 手順書と答え合わせを `docs/basic/` に集約し、実践編（[設計書](practical-handson.md)）の `docs/practical/` と対になる構成に再編成
