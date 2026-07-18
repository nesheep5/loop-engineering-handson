# ループエンジニアリング・ハンズオン

> You shouldn't be prompting coding agents anymore.
> You should be designing loops that prompt your agents. — Peter Steinberger

**エージェントにプロンプトを打つ**のをやめて、**エージェントにプロンプトを打つループを設計する**——
Addy Osmani のエッセイ [Loop Engineering](https://addyosmani.com/blog/loop-engineering/)（2026年6月）で
名前がついたこの考え方を、**2〜3時間**の手を動かす体験として学ぶハンズオンです。

概念の背景を先に知りたい方は [ループエンジニアリングとは何か](docs/what-is-loop-engineering.md) をどうぞ（約10分）。

## 対象者と前提

- 開発経験があり、**Claude Code を日常的に使っている**エンジニア
  （Claude Code の基本操作はこのハンズオンでは説明しません）
- Node.js 20 以上 / npm / git

## 学び方: 痛み駆動

機能を順に紹介する教材ではありません。各ステップでまず**手動運用の痛み**を体験し、
それを解消する形でループの構成要素をひとつずつ導入します。

| Step | 体験する痛み | 導入する部品 | 時間 |
|------|------------|------------|------|
| [0](docs/steps/step0.md) | 自分が「実行して結果を貼る係」になる | —（痛みの体験） | 20分 |
| [1](docs/steps/step1.md) | 毎回自分で検証するのが辛い | **検証ループ**（ゴール＋検証コマンド） | 35分 |
| [2](docs/steps/step2.md) | セッションが変わると全部忘れる | **外部状態**（BACKLOG.md） | 35分 |
| [3](docs/steps/step3.md) | 作った本人の自己採点は甘い | **検証の分離**（reviewer サブエージェント） | 35分 |
| [4](docs/steps/step4.md) | 毎回自分で起動するのが辛い | **自動化**（/loop）＋人間の役割の考察 | 45分 |

さらに先へ: [発展編](docs/advanced.md)（Worktrees / Skills / スケジュール実行 / MCP）、
[実践パターン集](docs/practices.md)（デファクトの設計原則を出典付きで整理）

## はじめ方

このリポジトリを **clone してそのまま**始めてください。すべての作業はローカルで
完結し、**push は一切使いません**（コミットはローカルに積むだけです）。
完走の記録を自分の GitHub に残したい場合や、発展編のクラウド実行・CI 常駐を
試したい場合だけ、fork してから始めてください。

```bash
cd app
npm install
npm test        # 6件失敗します。ここがスタート地点です
```

## 教材アプリ

`app/` に **欠陥入りの家計簿 CLI「kakeibo」**（TypeScript）が入っています。
バグ・lint 違反・未実装機能が意図的に仕込まれており、これらがループの「仕事」になります。

## リポジトリの歩き方

```
docs/steps/       ステップ別の手順書（step0.md から順に進む）
docs/what-is-loop-engineering.md  概念解説（背景知識の読み物）
docs/practices.md 実践パターン集（デファクトの設計原則と文献ガイド）
docs/advanced.md  発展編
docs/answers.md   答え合わせ（実施前に読まないこと）
app/              教材アプリ
SPEC.md           アプリの仕様書（Step 3 でレビューの判断基準になる）
BACKLOG.md        タスクの外部状態（Step 2 からループが読み書きする）
CLAUDE.md         エージェントが毎セッション読む基本情報（コマンド・規約）
.claude/agents/   reviewer サブエージェント定義
```

さあ、[Step 0](docs/steps/step0.md) から始めてください。
