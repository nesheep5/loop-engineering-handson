# Phase 1: チケット作成ループ

この Phase であなたが作るもの: PRD、planner エージェント定義
ループが作るもの: `tickets/` の Story 群

## 1. なぜこの部品か

雑な依頼を直接ループに食わせると迷走します（本編 Step 1 で体験済みのはずです）。
入口の判断を「検証可能なチケット」に翻訳するのが、この Phase で組み立てる部品です。

## 2. 作る1: PRD

[`docs/practical/prd-template.md`](prd-template.md) をコピーして `docs/practical/prd.md` を作り、記入します。

```bash
cp docs/practical/prd-template.md docs/practical/prd.md
```

記入例を写経しても構いませんが、**スコープ外と成功基準は自分の言葉で書き直してください**。
この2節はそのままループの手綱になります。他人の言葉のままでは、迷走を止める力を持ちません。

## 3. 作る2: planner エージェント定義

`.claude/agents/planner.md` を自作します。PRD を読んでチケットに分解するエージェント定義です。
以下の構成要素チェックリストをすべて満たしてください。

- [ ] 入力（PRD のパス）と出力（tickets/ への起票）が明記されている
- [ ] 良いチケットの4条件（機械検証可能な受け入れ基準 / 1周で完了する大きさ / 独立性 / 小さい diff）が指示に入っている
- [ ] `tickets/README.md` の frontmatter 仕様に従う指示がある
- [ ] `status: draft` で起票し、採否を人間に残す指示がある
- [ ] スコープ外に踏み込まない指示がある

詰まったら [`docs/practical/answers.md`](answers.md) の1節（planner エージェント定義の例）を参照してください。

## 4. 回す

新しいセッションで planner を起動します。プロンプト例:

```
planner サブエージェントで docs/practical/prd.md を tickets/ の Story に分解して
```

## 5. 人間の判断（採否）

起票された draft を1枚ずつ開き、次の観点で判定します。

- 受け入れ基準は実行して確かめられるか
- 大きすぎないか
- 重複・依存の絡まりはないか
- スコープ外が混ざっていないか

採用するものは `status: todo` に書き換え、却下はファイルを削除します。優先順位が
前後するなら `priority` を並べ直してください。判定基準に自信がなければ
[`docs/practical/answers.md`](answers.md) の4節（模範チケット分解）と見比べてください。

## 6. 確認（この Phase の完了条件）

```bash
grep -l 'status: todo' tickets/KAKEI-*.md
```

これが4枚以上を返せば完了です。`tickets/` をコミットして push してください
（実践編では自分の fork に push します）。

## 7. チェックポイント

チケット1枚のレビューにかかった時間は、そのチケットが生む diff のレビューにかかる
時間の何分の1でしょうか。

---

次は [Phase 2: 消化ループ](phase2-delivery-loop.md) です。
