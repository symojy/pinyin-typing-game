# 問題データ

| ファイル | 説明 | 語数 |
|----------|------|------|
| `questions-beginner.json` | 入门（`intro`）。**頻度・口語寄り**の核語彙＋1字語。`beginner-100-slot-plan.md` の字数割当（1字28・2字58・3字12・4字+2）に準拠 | 100 |
| `beginner-100-slot-plan.md` | 上記の**カテゴリ／字数スロット表**（設計用チェックリスト） | — |
| `questions-intermediate.json` | 中级（`medium`）。**入門の熟語と漢字列が同じものは含めない**独立リスト | 200 |

### 入門データの出典方針

- **SUBTLEX-CH**（映画・テレビ字幕コーパス）や **HSK 1 級前後**でよく出る語のイメージで選定（厳密な順位の丸写しではありません）。
- 中級 JSON と **漢字列が一致する語は入れない**（`scripts/build-beginner-100.mjs` が生成時に検査）。

```bash
npm run build:beginner
```

（`scripts/build-beginner-100.mjs` の `WORDS` を編集してから実行）

### 中級データの再生成

```bash
npm run build:intermediate
```

（`scripts/build-intermediate-200.mjs` の `WORDS` を編集してから実行）

※ 旧マージ用 `scripts/build-intermediate.mjs` は使わず、上記スクリプトが正です。
