# ECフォース部分テンプレ変数（正本）

`{# lp-code-* #}` の **名前・順序・巻く範囲**、および **`<title>` / meta description** の正本。  
[`works.html`](works.html) の本番変換と [`/audit`](.cursor/commands/audit.md) の合否は、このファイルを参照する。

- ここにない `{# lp-code-* #}` は **作らない**（必要なら提案のみ。採用はユーザー確認後）
- タグを **追加・改名・削除** するときは、ユーザー承認のあと **本ファイルを先に直し**、そのあと [`works.html`](works.html) を直す
- **`<title>` / description を変える** ときも同様。ユーザー承認 → **本ファイルを先** → `works.html` の同期箇所を直す（下記「同期箇所」）
- 本番変換・`/audit` では **文言・価格を変えない**。`title` / description は正本と **一致しているか照合** するだけ（勝手に書き換えない）
- 変換手順・パス置換は [`AGENTS.md`](AGENTS.md) §12
- 記法は `{# lp-code-名前 #}` / `{# /lp-code-名前 #}`。`{#` の直後と `#}` の直前は半角スペース。`{#lp-code-名前}` や `/{#` は使わない

---

## `<title>` / description（正本）

| 項目 | 値 |
|------|-----|
| `<title>` | STENA　5分で沸き立つ建築発想デザインの加熱式加湿器 |
| meta `description` | 高品質ステンレス×高速5分加湿のスチーム式加湿器「STENA」。清潔設計・自動洗浄・静音・高い安全性で寝室からリビングまで快適に加湿。デザインにもこだわった、長く使える本格派。 |
| `og:url` | https://stena.jp/ |
| 購入CTA `href` | #chatform |

`<meta name="description">` は HTML に置かない（本番環境が挿入）。正本の description 文言は `og:description` / JSON-LD の同期用。

**同期箇所**（`<title>` / description 文言を変えたら、`works.html` 内の次も同じ文言に揃える）:

| 箇所 | 揃える値 |
|------|----------|
| `<title>` | 正本の `<title>` |
| `og:title` | 正本の `<title>` と同じ |
| `og:description` | 正本の description と同じ |
| JSON-LD Product `name` | 正本の `<title>` と同じ |
| JSON-LD Product `description` | 正本の description と同じ |

`{# lp-code-head-common #}` は `<title>` の直後（charset / viewport / format-detection / canonical / favicon）。`<title>` / `<head>` は巻かない。`<meta name="description">` は含めない。

---

## 変数一覧（24）

| 順 | 変数 | 日本語（先頭コメント用） |
|----|------|--------------------------|
| 1 | `{# lp-code-head-common #}` | 共通 meta |
| 2 | `{# lp-code-head-og #}` | OG / Twitter |
| 3 | `{# lp-code-head-product #}` | JSON-LD 製品 |
| 4 | `{# lp-code-head-faq #}` | JSON-LD FAQ |
| 5 | `{# lp-code-head-css #}` | CSS / CDN |
| 6 | `{# lp-code-fv #}` | ファーストビュー |
| 7 | `{# lp-code-cta-coupon #}` | クーポン（CTA） |
| 8 | `{# lp-code-cta-offer #}` | 価格 |
| 9 | `{# lp-code-cta-purchase #}` | 購入特典（CTA） |
| 10 | `{# lp-code-voice #}` | ユーザーボイス |
| 11 | `{# lp-code-intro #}` | 導入 |
| 12 | `{# lp-code-product-design #}` | 製品：設計・清潔 |
| 13 | `{# lp-code-product-doctor #}` | 製品：医師コメント |
| 14 | `{# lp-code-product-speed #}` | 製品：速さ・モード・電気代 |
| 15 | `{# lp-code-product-look #}` | 製品：デザイン・実績 |
| 16 | `{# lp-code-product-tank #}` | 製品：タンク |
| 17 | `{# lp-code-product-closing #}` | 製品：紹介締め |
| 18 | `{# lp-code-howto #}` | 使い方 |
| 19 | `{# lp-code-dry-stress #}` | 冬の乾燥ストレス |
| 20 | `{# lp-code-recommend #}` | こんな方におすすめ |
| 21 | `{# lp-code-close #}` | LP締め |
| 22 | `{# lp-code-qa #}` | よくあるご質問 |
| 23 | `{# lp-code-specs #}` | 仕様 |
| 24 | `{# lp-code-foot #}` | モーダル / 追従CTA / JS |

howto 以降は **1セクション1パート**。CTA は必ず `cta-` 接頭辞。

---

## パート地図（切れ目の正）

| 変数 | 巻く範囲 |
|------|----------|
| `{# lp-code-head-common #}` | charset / viewport / format-detection / canonical / favicon |
| `{# lp-code-head-og #}` | `og:*` / `twitter:card` |
| `{# lp-code-head-product #}` | 製品 JSON-LD（Organization / WebSite / Product） |
| `{# lp-code-head-faq #}` | FAQPage JSON-LD |
| `{# lp-code-head-css #}` | fonts / Swiper CDN / `code-lp.css` / `js` クラス付与 |
| `{# lp-code-fv #}` | `.fv` |
| `{# lp-code-cta-coupon #}` | `.coupon` |
| `{# lp-code-cta-offer #}` | `.offer` |
| `{# lp-code-cta-purchase #}` | `.purchase` |
| `{# lp-code-voice #}` | `.voice` |
| `{# lp-code-intro #}` | `.intro-hook` / `.method-intro` / `.method-compare` |
| `{# lp-code-product-design #}` | `.steam-answer` から `.humid-diff` まで（間のメリット／メンテカード含む） |
| `{# lp-code-product-doctor #}` | `.doctor-comment` |
| `{# lp-code-product-speed #}` | `.steam-beyond` / `.steam-modes` / `.steam-cost` |
| `{# lp-code-product-look #}` | `.steam-design` / `.proof` |
| `{# lp-code-product-tank #}` | `.tank-*` |
| `{# lp-code-product-closing #}` | `.story-closing` |
| `{# lp-code-howto #}` | `.howto` |
| `{# lp-code-dry-stress #}` | `.dry-stress` |
| `{# lp-code-recommend #}` | `.recommend` |
| `{# lp-code-close #}` | `.lp-close` |
| `{# lp-code-qa #}` | `.qa` |
| `{# lp-code-specs #}` | `.specs` |
| `{# lp-code-foot #}` | `.footer` / `#lpModal` / `#fixCta` / Swiper JS / `code-lp.js` |

---

## `works.html` 先頭コメント（写す形）

変数名を列挙し、空行のあと同じ順で日本語を書く。右側に並べない。

```html
<!--
ECフォース部分テンプレ正本（手動貼り付け用）
各ブロックを {# lp-code-… #} の変数として登録する。

{# lp-code-head-common #}
{# lp-code-head-og #}
{# lp-code-head-product #}
{# lp-code-head-faq #}
{# lp-code-head-css #}
{# lp-code-fv #}
{# lp-code-cta-coupon #}
{# lp-code-cta-offer #}
{# lp-code-cta-purchase #}
{# lp-code-voice #}
{# lp-code-intro #}
{# lp-code-product-design #}
{# lp-code-product-doctor #}
{# lp-code-product-speed #}
{# lp-code-product-look #}
{# lp-code-product-tank #}
{# lp-code-product-closing #}
{# lp-code-howto #}
{# lp-code-dry-stress #}
{# lp-code-recommend #}
{# lp-code-close #}
{# lp-code-qa #}
{# lp-code-specs #}
{# lp-code-foot #}

共通 meta
OG / Twitter
JSON-LD 製品
JSON-LD FAQ
CSS / CDN
ファーストビュー
クーポン（CTA）
価格
購入特典（CTA）
ユーザーボイス
導入
製品：設計・清潔
製品：医師コメント
製品：速さ・モード・電気代
製品：デザイン・実績
製品：タンク
製品：紹介締め
使い方
冬の乾燥ストレス
こんな方におすすめ
LP締め
よくあるご質問
仕様
モーダル / 追従CTA / JS
-->
```
