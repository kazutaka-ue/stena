# ECフォース部分テンプレ変数（正本）

`{# lp-code-* #}` の **名前・順序・巻く範囲**、および **`<title>` / meta description** の正本。  
[`works.html`](works.html) の本番変換と [`/audit`](.cursor/commands/audit.md) の合否は、このファイルを参照する。

- ソースの正本は [`preview.html`](preview.html)。`works.html` へ出すときは preview の本文構成を前提に、切れ目コメントとパス置換だけを行う（§12）
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
| meta `description` | 高品質ステンレス×高速5分加湿のスチーム式加湿器「STENA」。清潔設計・CLEANモード・ターボモード時約33dBで寝室からリビングまで快適に加湿。デザインにもこだわった、長く使える本格派。 |
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

### 本番変換前：構造化データ立証チェック

[`LLMO.md`](LLMO.md) の「構造化データの立証チェック」に従う。本番変換・`/audit` では **文言を勝手に変えない**。不一致は報告のみ。

**チェック対象（`works.html` の head）**

- `{# lp-code-head-og #}`（`og:description`）
- `{# lp-code-head-product #}`（JSON-LD Product `description` / `additionalProperty`）
- `{# lp-code-head-faq #}`（FAQPage `acceptedAnswer.text`）

**手順**

1. 正本の description からキーフレーズ（例：自動洗浄・静音・高い安全性）を列挙する。
2. `works.html` の可視本文（`{# lp-code-fv #}` 以降、`{# lp-code-foot #}` 手前）で各語を grep し、同等以上の具体性・条件があるか確認する。
3. FAQPage JSON-LD と `{# lp-code-qa #}` の Q&A を diff し、完全一致を確認する。
4. 要注意語・字面不一致・条件の欠落があれば **警告リストとして報告**する（自動修正しない）。
5. `/audit` では `<title>` / description の正本一致に加え、**立証警告が残る場合は「要確認」として報告**する。

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
| 14 | `{# lp-code-product-speed #}` | 製品：速さ・電気代・静音 |
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
| `{# lp-code-intro #}` | `#introHook`（`.intro-hook.intro3-chapter`）から `#methodCompare`（`.method-compare.intro3-chapter`）まで。間の `.p4-chapter`（`#humidBelief` / `#throatDryness` / `#p4ColdAir`）を含む。旧 `.method-intro` は含めない |
| `{# lp-code-product-design #}` | `#steamAnswer` から `#steamFilterless` まで（清潔・フィルターレス。旧 `.humid-diff` 単独セクションは無し） |
| `{# lp-code-product-doctor #}` | `.doctor-comment`（`#doctorComment`） |
| `{# lp-code-product-speed #}` | `#steamBeyond` / `#steamCost` / `#steamQuiet`（速さ・電気代・静音。`.steam-modes` はタンク物語側） |
| `{# lp-code-product-look #}` | `#steamDesign` / `#proof` |
| `{# lp-code-product-tank #}` | `#nextLevel`（`.tank-hero`）から `#tankCompare` まで（間の `#steamPath` / `#tankSafety` / `#steamDaily` / `#steamModes` / `#steamCare` を含む） |
| `{# lp-code-product-closing #}` | `.story-closing`（`#storyClosing`） |
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
製品：速さ・電気代・静音
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
