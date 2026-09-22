# STENA LP ― LLMO（AI検索最適化）対応メモ

AI検索（Claude / ChatGPT / Perplexity / Google AI Overviews 等）にLPの内容を正しく読み取らせ、
引用・推薦されやすくするための対応方針と実装記録。

## 方針（決定事項）

- **画像LP → コードベースLP** に移行済み。主要な訴求・注記はすべてDOM上のテキストで保持する（AIは画像内文字をほぼ読めないため）。
- **canonical は不要**：テスト環境（feileb2.sakura.ne.jp）はクローズドのため設定しない。
- **価格は構造化データに記載しない**：LP毎に価格が微妙に異なるため、`offers`（価格情報）は Product スキーマに含めない。
- **FAQ セクションは後日追加**（下記テンプレート参照）。
- 構造化データには**ページ上に表示されている情報のみ**を記載する（非表示情報の記載はスパム判定・景表法リスク）。

## 実装済み（preview.html `<head>`）

| 項目 | 内容 |
|---|---|
| `<title>` | 製品名＋主要特徴（「STENA 次世代型スチーム加湿器｜約5分で温かい蒸気・316Tiステンレスタンク」） |
| `meta description` | **HTML には置かない**（本番環境が挿入）。文言の正本は `lp-code-vars.md`。`og:description` / JSON-LD は同期する |
| OGP / Twitter Card | `og:url` `og:image` は `〇〇` プレースホルダー。**本番反映時に本番URLへ差し替え** |
| JSON-LD `Product` | brand / description / color / countryOfOrigin / manufacturer / 寸法・重量 / additionalProperty（スペック9項目）。価格・gtin・material・award なし |

### 未確定プレースホルダー（`〇〇`）一覧

- `og:url`（本番URL）
- `og:image`（FV画像の絶対URL）
- JSON-LD `image`（製品画像の絶対URL）
- 本文側：電気代注記（比較対象機種・消費電力・運転モード）／動作音注記（当社測定・運転モード等で変動）

数値確定時は **本文の注記 → JSON-LD の順で同期更新** すること（例：動作音の測定条件が確定したら
`additionalProperty` の「動作音」にも条件を追記）。

## 残タスク（テンプレート）

### 1. FAQ セクション＋FAQPage スキーマ（後日追加）

会話型クエリ（「スチーム式 電気代 高い？」「手入れ 頻度？」）に対応。本文にFAQセクションを追加し、
同内容を JSON-LD で併記する。**本文に表示されるQ&Aと完全一致させること。**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "お手入れの頻度はどのくらいですか？",
      "acceptedAnswer": { "@type": "Answer", "text": "週1回程度、クエン酸を使ったCLEANモードでのお手入れをおすすめしています。フィルター交換は不要です。" }
    },
    {
      "@type": "Question",
      "name": "動作音はどのくらいですか？",
      "acceptedAnswer": { "@type": "Answer", "text": "〇〇モード運転時で約33dBです（当社測定値。運転モードや使用環境により異なります）。" }
    }
  ]
}
</script>
```

候補Q：電気代／動作音／お手入れ頻度／適用畳数／安全機能（子ども・ペット）／クエン酸は市販品で良いか／
蒸気が出るまでの時間／返金保証の条件

### 2. VideoObject スキーマ（サムネイル・公開日が確定したら追加）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "STENAと市販スチーム式の蒸気発生スピード比較",
  "description": "STENAと市販の他社製スチーム式加湿器を同一室内に設置し、同時に電源を入れて撮影した比較映像（比較対象のメーカー名は非開示）。",
  "contentUrl": "https://official.stena.jp/mov/stena-hikaku.mp4",
  "thumbnailUrl": "https://〇〇/img/〇〇.jpg",
  "uploadDate": "〇〇（YYYY-MM-DD）"
}
</script>
```

同様に 4段階加湿モード動画（stena4stage.mp4）分も追加する。

### 3. robots.txt（本番ドメインのみ）

AIボットの明示許可。テスト環境はクローズドのため対象外。
サーバー／WAF側で bot UA を一律ブロックしていないかも確認する。

```
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /
```

### 4. スペック表（`<table>`）の追加

LP末尾にテキストのスペック表を追加する（AIが最も引用しやすい形式）。
必要データ：消費電力／本体サイズ／重量／電源コード長／タンク容量／加湿量／適用床面積／動作音／安全機能。

### 5. ユーザーボイスのテキスト化

現在 `img/sample1.jpg` の画像1枚のためAIには不可視。テキスト化する際は体験談の根拠・代表性に注意
（景表法：調査概要・N数の明示が望ましい）。

### 6. llms.txt（優先度低・実験的）

サイト概要をMarkdownで `/llms.txt` に置く新提案。主要AI側の採用が未確定のため「置いても損はない」程度。

## ページ外施策（on-page より効果が大きい）

AIは複数ソースの一致で製品を評価するため、公式LP以外の言及を増やす：

- プレスリリース配信（製品名・スペックを本LPと一致させる）
- 比較メディア・レビューサイトへの掲載
- ECモール商品ページのスペック統一
- 受賞歴（iF DESIGN AWARD 等）の第三者検証可能な記録

## 運用上の注意

- **表示とスキーマの一致**：本文の文言を修正したら（特に数値・注記）、JSON-LD側も必ず同期する。
- **価格をスキーマに追加する場合**（将来方針が変わったら）：ページ表示価格と完全一致させ、
  キャンペーン変更時に連動更新できる運用体制が前提。
- **aggregateRating（星評価）は使用しない**：ページ上に実レビュー表示がない限り追加禁止。
- 景表法対応で修正した表現（約6倍※1・約5分※1・フィルター交換不要 等）を、
  meta description やスキーマ内で**条件を落とした強い表現に戻さない**こと。

## 構造化データの立証チェック（works 変換・公開前必須）

[`lp-code-vars.md`](lp-code-vars.md) の meta `description` は、本番変換時に `og:description` と JSON-LD Product `description` へ同期される。FAQPage は `{# lp-code-qa #}` の本文と完全一致させる（上記「表示とスキーマの一致」）。

### 原則

1. JSON-LD / `og:description` の各フレーズは、**可視本文**（`#qa`・カード・仕様・注記・FAQ 回答を含む）で、**同じ語句か、より弱い・条件付きの表現**で裏づけされていること。
2. FAQPage の `acceptedAnswer.text` は **`#qa` の Q&A と完全一致**（改行・注記・条件の有無も含む）。
3. 本文を直したのに head だけ古い訴求語が残る、またはその逆を、**変換完了とみなさない**。

### 要注意ワードリスト（初期版）

| 語 | リスク | 本文での確認先の例 |
|----|--------|-------------------|
| 高い安全性 | 性能断定・景表 | 安全機能の説明・FAQ・仕様の「チャイルドロック」等 |
| 自動洗浄 | 短縮による過大表示 | FAQ「自動洗浄**モード**」・howto の CLEAN |
| 静音 | 条件落ち | steamAnswer カード・FAQ の dB＋モード注記 |
| 清潔設計 | 抽象語 | 100℃スチーム・雑菌しにくい等の具体記述 |
| 感染・殺菌・治療系 | 薬機法 | 医師コメント・dryStress |

### 判定

| 区分 | 意味 |
|------|------|
| OK | 本文に同等以上の具体性・条件がある |
| 要修正 | 本文にない、または schema だけ条件が抜けている |
| 要ユーザー確認 | 本文を足すか、schema / 正本 description を弱めるか |

### エージェントの振る舞い（警告）

`works.html` 本番変換・`/audit` 時は、次を開いて上記リストで grep する。

- `{# lp-code-head-og #}`
- `{# lp-code-head-product #}`
- `{# lp-code-head-faq #}`

不一致・要注意語が残る場合は **警告リストとして報告**し、**変換完了扱いにしない**。勝手に [`lp-code-vars.md`](lp-code-vars.md) の description や JSON-LD を書き換えない。

修正する場合の順序：**ユーザー承認 → `lp-code-vars.md` 正本更新 → `works.html` の head 同期**（既存運用と同じ）。

### 既知の要注意例（正本未修正のまま再発しうる）

現行の meta `description`（Product / `og:description` 同期元）に含まれる **「自動洗浄」「静音」「高い安全性」** は、preview 系本文と字面・条件が一致していないことがある。

- **高い安全性** … 可視本文に同一語なしのことが多い
- **静音** … 本文は「約33dB」「ターボモード時」等の条件付き
- **自動洗浄** … 本文は「自動洗浄**モード**」のみ、という短縮のずれ

preview 側のコピーを直しても、**`lp-code-vars.md` を更新せず `works.html` に流すと schema だけ古い訴求が残る**。本番変換前に必ず立証チェックする。
