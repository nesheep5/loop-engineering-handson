# tickets/ — JIRA 風チケット管理(ローカルモック)

実践編のチケット置き場です。JIRA の本質概念(Epic/Story、ステータス遷移、
受け入れ基準)だけを Markdown で再現しています。専用ツールはありません。
1チケット=1ファイルで、メタデータは frontmatter が持ちます。

## ファイル命名

- Epic: `EPIC-<連番>.md`(例: `EPIC-1.md`)
- Story: `KAKEI-<連番>.md`(例: `KAKEI-101.md`)

## frontmatter 仕様

```yaml
---
id: KAKEI-101      # ファイル名と一致させる
type: story        # epic | story
status: draft      # draft | todo | in-progress | in-review | done
priority: 1        # 数字が小さいほど優先(epic は省略可)
epic: EPIC-1       # 親 Epic の id(story のみ)
---
```

## 本文の構成(story)

```markdown
# <タイトル>

## 背景

なぜこの Story が必要か(1〜3行)

## 受け入れ基準

- [ ] 機械検証可能な条件で書く
      (例: `npm run --silent kakeibo -- report 2026-07` が HTML を標準出力に出す)
```

## ステータス遷移

```
draft ──(人間が採用)──▶ todo ──(ループが着手)──▶ in-progress
  │                                                │
  └─(人間が却下: ファイル削除)                     ▼ (PR 作成)
         done ◀──(人間がマージ後に更新)── in-review
```

- **人間の仕事は2つの遷移だけ**: `draft → todo`(採否)と `in-review → done`(マージ)
- それ以外の遷移はループが frontmatter を書き換えて進めます
- 本編の BACKLOG.md のチェックボックスが、実務ではこのステータス遷移に進化します
