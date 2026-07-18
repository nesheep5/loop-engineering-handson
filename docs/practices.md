# 実践パターン集 — デファクトの設計原則

「ループエンジニアリング」という名前は2026年6月生まれですが、実践はその前から
積み上がっており、独立した実践者たちがほぼ同じ結論に収斂しています。
ここでは出典付きで、デファクトと呼べる設計原則をまとめます。
ハンズオン本編を終えてから読むと、各原則がどのステップに対応するか分かるはずです。

## 1. ループに向く仕事を見極める

ループ設計の最初の判断は「何をループさせるか」です。Simon Willison は
コーディングエージェントを**総当たりで解を探すブルートフォース装置**と捉え、
向いている問題の条件を挙げています。

- **成功基準が明確**（機械的に判定できる）
- **解にたどり着く過程が試行錯誤**（何度も変えて試すのが自然な問題）

「うわ、これ何パターンも試すことになりそうだな」と思ったら、それがループを
仕込むシグナルです。典型例はデバッグ、性能最適化（ベンチマークを回しながら改善）、
依存パッケージの更新、コンテナイメージの縮小など。逆に、成功の判定が人間の主観に
しかできない仕事（デザインの良し悪しなど）は、そのままではループになりません。

そして全ケースに共通する増幅装置が**堅牢な自動テスト**です。テストが充実した
コードベースでは、同じエージェントが何倍も強く働きます。

出典: [Designing agentic loops — Simon Willison](https://simonwillison.net/2025/Sep/30/designing-agentic-loops/)

## 2. 検証は段階的に強くする

Claude Code の公式ベストプラクティスは「**Claude に自分の仕事を検証する手段を
与えよ**」を最重要原則に置き、検証の強度を4段階で使い分けることを勧めています。

| 段階 | 方法 | 特徴 |
|------|------|------|
| 1 | プロンプト内で「テストを実行して通るまで直して」 | 準備ゼロ。本ハンズオン Step 1 |
| 2 | `/goal` の達成条件にする | 別の評価モデルが毎ターン条件を再検査し、達成まで制御を返さない |
| 3 | Stop hook でスクリプトをゲートにする | 決定論的。チェックが通るまでターンを終了させない |
| 4 | 検証サブエージェント / 反証ワークフロー | 別コンテキストのモデルが結果の反証を試みる。本ハンズオン Step 3 |

段階が上がるほど準備は重くなりますが、**無人で回しても正しく終わる**ループに
近づきます。あわせて重要なのが**証拠主義**です。「できました」という自己申告ではなく、
実行したコマンドとその出力（テスト結果、スクリーンショット）を提出させます。
証拠のレビューは再検証より速く、見ていなかったセッションにも効きます。

出典: [Best practices — Claude Code Docs](https://code.claude.com/docs/en/best-practices)

## 3. Ralph の原則 — 忘れっぽさを設計で活かす

命名前夜のもっとも過激で有名な実践が、Geoffrey Huntley の **Ralph Wiggum 技法**です。
その本体はたった1行のシェルループです。

```bash
while :; do claude -p "$(cat PROMPT.md)"; done
```

エージェントを起動し、死んだらまた起動する。それだけ。それでも実プロダクトが
作られてきたのは、次の原則が効いているからです。

- **毎周、新品のコンテキストで始める**: 前の周の混乱や失敗を引き継がない。
  記憶はすべてディスク上のファイル（PROMPT.md、優先順位付き TODO、仕様書）が持つ
- **1周1タスク**: コンテキストウィンドウを1つの仕事に集中させる。
  欲張ると品質が落ちる
- **backpressure（背圧）を用意する**: テスト・型システム・linter が「間違った出力は
  先に進めない」圧力として働く。ループの品質はこの背圧の品質で決まる
- **失敗はデータ**: 変な方向に行ったらループを責めずにプロンプトを直す。
  「ギターのチューニングのように」ループ自体を改善する——これは
  **ループの外側にある、人間が回す改善ループ**です

本ハンズオンの BACKLOG.md・`/clear` して同じプロンプトを打つ演習（Step 2）は、
この原則の縮図です。なお Ralph 型ループは Claude Code の公式プラグインにもなっています。

出典: [Ralph Wiggum as a "software engineer" — Geoffrey Huntley](https://ghuntley.com/ralph/)

## 4. 安全装置 — 自由と引き換えの必須要件

ループの生産性は、エージェントが承認待ちなしで動けるほど上がります。
しかし無承認の実行には、ファイル破壊・情報流出・踏み台化のリスクが伴います。
実践者の答えは一致していて、「祈る」のではなく**環境で縛る**ことです。

- **サンドボックスで回す**: コンテナや外部環境（クラウド実行環境）で、
  理想的にはネットワークを遮断または許可リスト化して実行する
- **権限をスコープする**: `--allowedTools` や許可リストで、そのループに必要な
  操作だけを許す
- **クレデンシャルと予算を絞る**: 本番の認証情報は渡さない。課金が発生しうる
  キーは専用に発行し、少額の上限を設定してから渡す
- **停止条件を先に決める**: 最大試行回数・トークン予算・時間の上限（Step 1 参照）

本ハンズオンの kakeibo が「壊しても何も起きない砂場」なのは偶然ではなく、
安全装置を省略してループの学習に集中するための設計です。実案件では省略できません。

出典: [Designing agentic loops — Simon Willison](https://simonwillison.net/2025/Sep/30/designing-agentic-loops/)、[Best practices — Claude Code Docs](https://code.claude.com/docs/en/best-practices)

## 5. 個別の失敗をシステムの改善に変える

Anthropic 公式のループ入門は、ループ運用の習熟を「失敗の扱い方」で語っています。
ループが変な出力をしたとき、その場で直して終わりにせず、**同じ失敗が二度と
起きないようシステム側に埋め込む**——検証手順を skill に、規約を CLAUDE.md に、
絶対に守らせたいルールを hook に昇華します。

これは Ralph の「失敗はデータ」と同じ構図です。ループエンジニアの仕事は
1周ごとの結果への一喜一憂ではなく、**周回を重ねるほどループが賢くなる構造**を
作ることにあります。

出典: [Loop engineering: Getting started with loops — Anthropic](https://claude.com/blog/getting-started-with-loops)

## 6. レビューをループの外に残さない — PRレビューボトルネックの克服

生成側をループ化すると、律速段階は書く速度からレビューする速度に移ります。
Armin Ronacher は「歴史的にはコードを書く方が読むより遅かったが、AI 支援で逆転した」
と指摘し、自身が関わる OpenClaw では未処理 PR が2,500件を超えた実例を挙げています。
Anthropic 社内でも、エンジニアのコード生産量が約200%増えた結果、チームの
ボトルネックはレビューに移りました。著名実践者の対策は、次の4つの原則に収斂しています。

**原則A: 機械が書くなら、機械が先にレビューする。** Ronacher の結論は明快です——
「If the machine writes the code, the machine better review the code at the same time.
（機械がコードを書くなら、機械が同時にレビューした方がいい）」。レビューを
マージ前の人間の作業として残すのではなく、**ループの一工程として組み込み**、
人間に届く時点で「最も有能な機械による最も厳しいレビュー」は通過済みにします。

- Peter Steinberger は PR を出す**前**に自動レビュー（autoreview）を数時間単位で走らせる
  運用を「スタックに加えた中で最も効果が大きいスキル」と評しています
- Anthropic の Code Review 機能は「並列にバグを探索 → 検証で偽陽性を除去 →
  重大度でランク付け」というマルチエージェント構成で、社内では実質的な
  レビューコメントが付く PR の割合が 16% から 54% に上がりました
- 本ハンズオン Step 3 の reviewer subagent は、この原則の最小形です

**原則B: 出す側が証拠を同梱する。** Simon Willison は「未テストの AI 生成コードの
提出はソフトウェアエンジニアとしての職務怠慢」と断じます。Addy Osmani はこれを
「PR 契約」として定式化しました——①変更の意図（なぜやるか）②動作証明（テスト結果・
スクリーンショット・ログ）③リスク評価（AI が書いた箇所と危険度）④人間の判断が
必要な箇所の明記。セクション2の証拠主義を、PR という単位に適用したものです。
レビュアーの仕事が「正しさをゼロから確かめる」から「証拠を検分する」に変わります。

**原則C: 小さく、層で出す。** エージェントの PR は人間のものより平均51%大きくなる
という測定があり、大きな diff はレビュー不能の主因です。対策は生成時点でのサイズ
制約と、依存関係のある小さな PR のチェーンとして出す **stacked PRs** です。
各層のレビュー対象はその層の diff だけになり、下から順にマージすることで
「検証済みの挙動の上にだけ積む」構造になります。

**原則D: AI レビューはセンサー、人間は判定。** Osmani は AI レビューを「判定
（judge）ではなくセンサー」と位置づけます。異なるアーキテクチャの4つのレビュー
ツールを並列実行した検証では、検出されたバグの93.4%は1つのツールしか見つけて
おらず、異質なレビュアーの並列が効きます。ただしセンサーがいくら増えても、
リスクに応じてレビューの深さを変える判断（設定変更は軽く、決済パスは多層に）と
マージの最終権限は人間に残します。Ronacher が言うとおり「非知覚的な機械は責任を
負えない」——これは[人間に残る3つの責任](what-is-loop-engineering.md#人間に残る3つの責任)の
検証責任そのものです。

出典: [The Final Bottleneck — Armin Ronacher](https://lucumr.pocoo.org/2026/2/13/the-final-bottleneck/)、[Agentic Code Review — Addy Osmani](https://addyosmani.com/blog/agentic-code-review/)、[Code Review in the Age of AI — Addy Osmani](https://addyo.substack.com/p/code-review-in-the-age-of-ai)、[Code Review for Claude Code — Anthropic](https://claude.com/blog/code-review)、[Simon Willison の投稿](https://fedi.simonwillison.net/@simon/115741153519437110)、[Peter Steinberger の投稿](https://x.com/steipete/status/2059453909819654554)

---

## さらに読む — 文献ガイド

著者の実績と実践者コミュニティでの評価を基準に選定しています。

| 文献 | 著者・位置づけ | 読みどころ |
|------|---------|-----------|
| [Loop Engineering — Addy Osmani](https://addyosmani.com/blog/loop-engineering/) | Google のエンジニアリングリーダー。原典（2026年6月） | 5つの部品＋外部状態、人間に残る責任 |
| [Designing agentic loops — Simon Willison](https://simonwillison.net/2025/Sep/30/designing-agentic-loops/) | Django 共同開発者・著名な AI 実践者。命名前の理論的原点（2025年9月） | 適用判断の基準、YOLOモードとサンドボックス |
| [Ralph Wiggum — Geoffrey Huntley](https://ghuntley.com/ralph/) | 技法の考案者。コミュニティで広く追試され Claude Code 公式プラグイン化（2025年7月） | fresh context・1周1タスク・背圧 |
| [Getting started with loops — Anthropic 公式](https://claude.com/blog/getting-started-with-loops) | Claude Code 開発チームによる公式の体系化 | 4つのループ分類、トークン管理 |
| [Best practices — Claude Code Docs](https://code.claude.com/docs/en/best-practices) | 公式ドキュメント | 検証の4段階、コンテキスト管理、fan-out |
| [The Final Bottleneck — Armin Ronacher](https://lucumr.pocoo.org/2026/2/13/the-final-bottleneck/) | Flask 作者・Sentry 共同創業者（2026年2月） | レビューが最終ボトルネックになる構造、機械レビューの必然、責任の所在 |
| [Agentic Code Review — Addy Osmani](https://addyosmani.com/blog/agentic-code-review/) | 原典エッセイの著者によるレビュー各論 | リスク階層別レビュー、異種 AI レビュアーの並列、PR 契約 |
| [Code Review for Claude Code — Anthropic 公式](https://claude.com/blog/code-review) | Claude Code 開発チーム | マルチエージェントレビューの仕組みと社内実測値（16%→54%） |
| [Loop Engineering実践 — DevelopersIO](https://dev.classmethod.jp/articles/claude-loop-engineering-practice/) | クラスメソッドの技術ブログ。日本語の実装レポート | 6段階の実装パターン、Verifier Theater、コスト実測 |
