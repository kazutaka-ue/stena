# STENA LP — エージェント／引き継ぎ正本

このファイルは **作業方針・デザインルール・SEO・表現ルールの単一の正本** である。  
Cursor / Claude Code / 第三者コーダーは、実装前に本ファイルを読むこと。

詳細の二重管理を避けるため、`.cursor/rules/*.mdc` は本ファイルへの短い参照のみとする。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| 種別 | 静的 HTML/CSS/JS のランディングページ（LP） |
| 製品 | STENA 次世代型スチーム加湿器 |
| 主作業ファイル | [`preview.html`](preview.html)（マークアップ。JSON-LD は head 内インライン） |
| スタイル | [`css/code-lp.css`](css/code-lp.css)（`:root`・セクション CSS） |
| スクリプト | [`js/code-lp.js`](js/code-lp.js)（挙動。Swiper CDN の後に読込） |
| 画像 | [`img/`](img/) |
| 補助 | [`serve-debug.mjs`](serve-debug.mjs)（任意のローカル確認用） |
| 表示監査 | [`layout-audit.mjs`](layout-audit.mjs)（PC/SPの全ページ可読性監査。§8） |
| ECフォース | [`works.html`](works.html)（貼り付け正本。`{# lp-code-* #}` 分割。§12） |
| 実験・差分 | `dif.html` / `stena-section-redesign.html` など。**本番相当は `preview.html`** |

バックエンド（Node API / PHP 等）の新規開発はしない。静的・効率的な HTML/CSS/JS 管理を優先する。

---

## 2. 作業スタンス

- 依頼者は **HTMLコーダー**。実装は既存パターンに寄せ、過剰なフレームワーク化をしない。
- コミット・push・PR は **明示依頼があるときだけ**。
- UI/UX・保守性に欠点があれば遠慮なく反対する。同調のための同意は不要。
- コピー変更時は見た目だけでなく **表現リスク（§7）** も点検する。
- 新規セクション追加時は、実装前に **見出しアウトライン（§6）** を確認する。

---

## 3. ページ構成（セクション地図）

おおよその上から下の流れ。`id` はアンカー／JS／`aria-labelledby` 用。

### 単体 section・製品暗帯・汎用 `lp-*`

- ボディ直下のコンテンツは原則 **独立した `section`**（見た目用のラッパ `div` は使わない）。
- **製品パートの黒帯**は `.lp-section--dark`（`background` / `color` / 標準上下余白）。章ラッパや固有クラスに黒を持たせない。
- **再利用UI**は固有 section 名を付けず `lp-*` にする（例: `lp-inner` / `lp-carousel` / `lp-card` / `lp-modal`）。どの section からも同じクラスで使える。
- 章固有の共通トークンだけ CSS の `:is(.tank-hero, …)` 等に残す（HTML へのスキンクラス連打はしない）。
- 将来の EC 部分テンプレは **section 単位** で切る。
- `#fixCta` / `#lpModal` はページ共通 UI として末尾に置く。

| 順 | クラス／塊 | 主な id | 役割 |
|----|------------|---------|------|
| 1 | `.fv` | `fvTitle`（h1） | ファーストビュー・ブランド |
| 2 | `.coupon` | `coupon` | クーポン |
| 3 | `.offer` | `offer` | お得プラン |
| 4 | `.purchase` | `purchaseBenefits` | 購入特典 |
| 5 | `.voice` | `voice` | ユーザーボイス |
| 6 | `.intro-hook` | `introHook` | ①共感と問い：朝の喉の乾き／湿度だけで十分か |
| 7 | `.method-intro` | `methodIntro` | ②数字と喉の仕組み：50％→12％の概算／水分の行き先 |
| 8 | `.method-compare` | `methodCompare` | ③解決方法の検討：加湿＋暖かさ／併用／スチーム式 |
| 9 | `.steam-answer` | `steamAnswer` | ④結論：STENAの設計方針（章頭・製品モード起点） |
| 11 | `.lp-section--dark` + `.lp-carousel` ×2 | steamAnswerCardsTitle / steamMaintenance | メリット／メンテ（汎用カード列・SP縦／PC横） |
| 12 | `.humid-diff` | `humidDiff` | 水滴 vs 水蒸気 |
| 13 | `.doctor-comment` | `doctorComment` | 医師コメント |
| 14 | `.steam-beyond` + `.lp-carousel` | `steamBeyond` | 我慢の時代終わり → 速さ（章内 h3） |
| 15 | `.steam-modes` | `steamModes` | 4段階モード |
| 16 | `.steam-cost` | `steamCost` | 電気代 |
| 17 | `.steam-design` | `steamDesign` | デザイン刷新 |
| 18 | `.proof` | `proof` | 実績・受賞（数字は h にしない） |
| 19 | `.tank-*`（各独立 section） | 各 tank 見出し | ステンレスタンク物語（固有トークンは CSS `:is`） |
| 20 | `.story-closing` | `storyClosing` | 製品パート締め（動画＋下コピー） |
| 21 | `.howto` | `howto` | 使い方 STEP |
| 22 | `.dry-stress` | `dryStress` | 冬の乾燥ストレス |
| 23 | `.recommend` | `recommend` | こんな方におすすめ |
| 24 | `.lp-close` | `lpClose` | LP 締め（`img/lpclose_bg.jpg`） |
| 25 | `.qa` | `qa` | よくあるご質問 |
| 26 | `.specs` | `specs` | 仕様 |
| 27 | `.footer` | — | 法定リンク／販売者／コピーライト（見出しなし） |

### 見出しまわりの直近意図（壊さない）

- 導入部 ①〜④ は「共感 → 再定義 → 絞り込み → 結論」で1本の論理。**同じ主張を2つのセクションで繰り返さない。**
  ③で「スチーム式は空気を冷やさずにうるおいを足せる」と結論済みのため、④はその再宣言ではなく **STENA という製品の設計方針** を語り、直後のメリットカード（清潔／静音／お手入れ）へ渡す。
- **導入で一般論の数値グラフ・カウンターを持ち出さない。** 相対湿度の換算を静的に書く場合は**概算＋注記必須**。g/m³ カウンターやスクラブで滞在時間を消費しない。
- **「部屋が暖かくなる／暖房代わり」と読める書き方をしない。**（§7）スチーム式の温度面の利点は **「加湿しても空気を冷やさない」** と書く。
- **他方式が部屋を冷やす／熱を奪う、とは書かない。** 他方式は構造の記述に留める。
- 現在の `preview.html` 導入部は `/intro` の素材範囲を確認するための構成案。コピーは未確定であり、`works.html` へ同期する前に上記の温度表現と §7 を再点検する。
- **オファー先行（coupon / offer / purchase を導入部より上）は確定仕様。入れ替えを提案しないこと。**
- **①は問いかけ（`.intro-hook__ask`）→ 断定（h2）の順を崩さない。**
- **読者への問いかけを eyebrow 扱いにしない。** 中見出し相当（`--type-h-md-*`）＋濃い色。
- 問いかけと直後の見出しは **`clamp(2.5rem,8vw,3.5rem)` 程度の間隔**を空ける。
- **導入部にピン留め（sticky scrub）は置かない。**
- `img/winter_morning.jpg` は使用しないこと。
- ①〜③は明るい編集トーン。黒（製品モード）は `.steam-answer` から始める。
- `steam-beyond`: 章主題は h2、「約6倍速く」は **h3**。
- メリット／メンテ: 独立 `section` + 各自 h2。`.lp-carousel` / `.lp-card`（SP縦／PC横）。
- `dry-stress__close` / `steam-design__feature-text` / `lp-close__end`: 見た目の締めは **見出しタグ**。

---

## 4. デザインシステム（`:root`）

定義場所: [`css/code-lp.css`](css/code-lp.css) 先頭付近の `:root`。値を変えるときはここを触り、セクションごとの再発明をしない。

### 色・面

| トークン | 用途 |
|----------|------|
| `--bg` / `--bg-dark` / `--bg-cool` | 白／黒／クール面 |
| `--ink` / `--ink-muted` | 明帯テキスト |
| `--ink-cool` / `--ink-cool-muted` | クール帯テキスト |
| `--ink-on-dark` / `--muted-on-dark` | 暗帯テキスト |
| `--steam-warm` / `--steam-warm-deep` / `--accent` | スチーム系アクセント |
| `--gold` ほか | クーポン金など |

セクション固有色（coupon 金、offer `--offer-color`、recommend 灰など）は **そのセクションのローカル変数** に閉じる。

### タイポ（役割）

| 役割 | トークン | 使い所 |
|------|----------|--------|
| 大見出し／大リード | `--type-h-lg-*` / `--type-lead-lg-*` | 章のテーマ宣言 |
| 中見出し／中リード | `--type-h-md-*` / `--type-lead-md-*` | 章内の機能・詳細 |
| カード | `--card-title-*` / `--card-body-*` / `--card-note-*` | カード内 |
| 注記 | `--type-note-*` | ※注など |

**HTML の h2/h3 と、見た目の大／中は別。** 新規セクションは上記のどれかを明示してトークンを使う。shared type セレクタ群（`css/code-lp.css` 内「shared type」コメント周辺）にクラスを足す。

### レイアウト

| トークン | 目安 |
|----------|------|
| `--gutter` / `--gutter-lg` | 横ガター |
| `--section-pad-y` | 標準セクション上下余白 |
| `--content-sm` … `--content-xl` | 650 / 700 / 920 / 1040 / 1100px |
| `@media (min-width:761px)` | PC 寄せの主ブレーク（`--type-scale: 1.1`） |

### 黒背景の上下余白（必須）

黒背景（`--bg-dark`）の標準セクション:

1. HTML に **`lp-section--dark`**（または明帯なら `lp-section`）
2. 暗帯の色・余白は **`.lp-section--dark`**（`background` / `color` / `padding-block: var(--section-pad-y)`）
3. セクション CSS に上下 padding や黒背景の個別指定を足さない（章固有の例外を除く）

**例外（個別維持）**

- `steam-answer` — 前セクション接続 + min-height（`padding-block-end` のみ）
- `tank-hero` / `steam-beyond` — 章頭ヒーロー。余白は `--section-pad-hero`（標準の `--section-pad-y` より厚い）
- `lp-close` — full-bleed 画像ヒーロー

新規例外が必要ならユーザー確認後。値変更は `--section-pad-y` を優先。

---

## 5. セクション実装方針

新しいブロックや見た目を足すとき、次の順で判断する。

1. **既存セクションを再利用** — 近い HTML・クラス・トークンがあれば流用・拡張
2. **無理なら新規** — 寄せると破綻するときだけ
3. **CSS を際限なく増やさない** — 同じ色・余白・幅・タイトル階層をセクションごとに再発明しない
4. **統一感** — `:root` と既存パターンに寄せる

### やってよいこと

- 既存クラス・セクション変数のエイリアス／参照
- セクション固有の色・余白だけローカル変数に残す
- 本当に必要なときだけの新規セクション＋最小限の CSS

### やってはいけないこと

- 似た見出し・リード・ガターを別名で量産する
- 「一応共通化」で巨大な万能クラスや tank 級微細トークンを全ページに展開する
- 既存で足りるのに、見た目が少し違うだけで丸ごと新規 CSS ブロックを追加する

### 判断の目安

- 構造が同じで色・コピーだけ違う → 既存を再利用
- インタラクションやレイアウトの意図が違う → 新規でよいが、色・幅・gutter は `:root` / 既存トークン

---

## 6. SEO / 見出し構造（必須）

静的 HTML LP でも、検索・アクセシビリティのアウトラインを壊さない。見た目都合で見出しを `div` / `p` / `span` に落とさない。

### 必須

1. **h1 はページに1つ** — ブランド／製品の主題。キャンペーン・価格・クーポン文言を h1 にしない
2. **セクションの主題は h2** — 下は h3、さらに h4。階層を飛ばさない
3. **見た目が見出しなら見出しタグ** — 大きなコピー・ブロックタイトルをごまかさない
4. **ラベル・注釈・バッジは h にしない** — eyebrow、※注記、販促バッジ、UIチップ、受賞の数字は `p` / `span` / `small`
5. **section は見出しと紐づける** — 可能なら `aria-labelledby`（または意味のある `aria-label`）

### やってはいけないこと

- デザイン調整のために見出しを廃止してクラス付き `div`/`p` にする
- 装飾テキストや受賞バッジ内の数字を h にしてアウトラインを汚染する
- 同一ページに複数 h1
- 「とりあえず全部 h2」で階層を平坦化する（カード群は親 h2 の下で h3/h4）

### 判断の目安

- その文言だけ読んでも「このブロックのテーマ」と分かる → 見出しタグ
- 補足・注釈・誘導・装飾 → 見出しにしない

---

## 7. 広告・効能表現の自己点検

HTML/CSS の見た目作業でも、**コピー変更時は必ず表現リスクを点検**する。法務の確定判断ではないが、引っかかりやすい表現は避け、代替案を出す。

対象: 家庭用加湿器・スチーム方式・素材・清潔・医師コメントなど。医療機器広告ではないが、衛生・健康文脈では慎重に扱う。

### 優先して疑う表現

1. **絶対断定** — 「正しい」「完璧」「絶対」「必ず」「一切〜ない」「ゼロ」（条件・主語なし）
2. **他方式・他社の否定** — 「他は間違い」「劣る」と読める比較
3. **医療効能** — 治療・予防・殺菌保証・粘膜改善など（医師コメントは見解＋注記必須）
4. **優良誤認** — 根拠のない No.1／最速／完全防錆／剥がれない、など
5. **効果効能の保証** — 「潤いが続く」「清潔が続く」の無条件保証

### やってよいこと

- 「〜しやすい」「〜に向く」「設計上〜」など条件付き・傾向
- 「スチーム式の強みは〜」「選ぶなら方式から」など価値の整理（断定の「正しい」は使わない）
- 医師コメントは個人の見解＋効果非保証の注記を維持
- 疑わしいときは代替案を複数提示してから反映

### 差し替えの型

| 避けたい | 寄せ方の例 |
|----------|------------|
| 〜は正しい | 〜という選択／〜の強みを活かす |
| 一切ない／ゼロ | 〜しにくい／設計上〜を抑える |
| 必ず／絶対 | 〜をめざす／〜しやすい |
| 殺菌・治療 | 清潔な加湿／衛生面で安心しやすい（断定しない） |

強い表現で法務確認が必要なら、ユーザーに確認を求める。

景表・表現の経緯説明は [`client-explanation.md`](client-explanation.md) も参照。

---

## 8. フロント見た目の注意（この LP 向け）

- **既存のデザイン言語を壊さない。** 汎用の「AIっぽい」見た目（紫グラデ、クリーム＋テラコッタ、新聞調など）へ寄せ直さない。
- カードは相互作用や理解に必要なときだけ。ヒーローにカードを載せない。
- 新規ビジュアルは既存セクション（tank / howto / dry-stress / recommend / lp-close 等）の構図・トークンに寄せる。
- full-bleed 締め（`lp-close`）は製品が下に来る構図。テキストがプロダクトに被らないよう下パディングで帯を確保する。
- `story-closing` は独立動画（`morning.mp4`）を上、締めコピーを下に置く縦積み。動画を背景に敷き直さない。

### 可読性・実画面検証（必須）

- **連続して読む主張・説明は、中央の単一読書軸を原則とする。** PC幅を使うためだけに因果関係のある文章を左右カラムへ分けない。
- 左右配置は、比較・仕様・独立した選択肢など、読む順序が明確な要素に限る。
- **1つのsceneを1枚の製品ページとして編集する。** 実装前に「導入／主見出し／リード／根拠／観察／締め」から必要な役割だけを選び、主役は1つに限定する。
- 章内sceneは必要に応じて `.lp-story-panel` + `data-layout-panel` とし、要素へ `data-type-role="main|lead|support|evidence|observation|close"` を付ける。`main` は各panelに必ず1つだけ置く。
- 設定・観察・結論を同じサイズ／ウェイトで連続させない。締めは主見出しより小さくし、リードと本文には明確なサイズ差を付ける。
- 読書順は原則 **設定 → 主張 → 根拠 → 観察 → 締め**。根拠を見せる前に複数の結論を重ねない。
- `--type-display-*` は短い命題・数値に使う。長い文章へ適用して狭い幅に押し込み、多行化させない。
- PC見出しはコンテナ幅による自然な折返しを基本とする。通常の `<br>` は安易に置かず、SPだけの改行は `.br-sp` を使う。PCの固定改行が必要な場合は、実画面で孤立行がないことを確認する。
- 本文の目安はPC 16px以上／SP 14px以上。これを下回ってよいのは注記・英字ラベル・バッジなど、本文ではない要素だけ。
- HTML/CSS変更後は、全ページの自動監査を必ず実行する。

```shell
node layout-audit.mjs
```

- 変更したセクションは `--capture` で指定し、390×844／1440×1000の実寸スクリーンショットも確認する。

```shell
node layout-audit.mjs --capture=introHook,methodIntro,methodCompare
```

- 合否は、panel内の主役数・相対的な強調階層、見出し最小サイズ、過剰行数、短い孤立最終行、狭い文章カラム、横溢れで判定する。`--report-only` は既存状態の調査専用で、完了判定には使わない。
- 全ページを縮小した縦長画像だけで「読みやすい」と判断しない。出力されたPC/SPのセクション画像を等倍で見る。
- レポートと画像はOSの一時フォルダへ出力される。問題を無条件に許可リストへ追加して監査を通さない。

---

## 9. 実装パターン

### shared type

タイポはセクション独自 `font-size` より、既存の shared type セレクタにクラスを追加する。

### スクロール表示

```html
<div class="… reveal reveal--up" data-reveal-delay="80">…</div>
```

```js
initRevealInView('.reveal');
```

`.reveal` を付ければ足りる。セレクタの列挙は不要。

### SP 改行

- `.br-sp` — SP のみ改行（PC では非表示になる既存ユーティリティ）
- PC 1行固定が必要なら `@media (min-width:761px){ white-space:nowrap; }` ＋幅確保

### 画像・a11y

- 装飾画像は `alt=""` + 必要なら `aria-hidden="true"`
- `loading="lazy"` / `decoding="async"` を既存に合わせる
- `section` には可能な限り `aria-labelledby`

### tank 系

タンク物語は `.tank-inner` / `.tank-title` / `.tank-lead` / `.tank-merit` など共通部品を再利用。アイコンは `tank-merit__ico` 系の線画スタイル（円枠 + accent）に合わせる。

---

## 10. 関連ドキュメント

| ファイル | 役割 |
|----------|------|
| [`AGENTS.md`](AGENTS.md) | **本ファイル** — 実装・方針の正本 |
| [`works.html`](works.html) | ECフォース貼り付け正本（§12） |
| [`lp-code-vars.md`](lp-code-vars.md) | ECフォース `{# lp-code-* #}` 変数の正本 |
| [`LLMO.md`](LLMO.md) | AI検索最適化・JSON-LD・公開前プレースホルダ（`〇〇`）・FAQPage 注意 |
| [`client-explanation.md`](client-explanation.md) | クライアント向け「なぜテキストLPか／景表対応の説明」 |
| `.cursor/rules/*.mdc` | Cursor 用の薄いポインタ（内容は本ファイル） |

構造化データ（Product / FAQPage）や `og:*` の本番差し替えは **LLMO.md の手順に従い、本文表示と JSON-LD を同時更新**すること。価格は Product スキーマに載せない（LP と差が出るため）——詳細は LLMO.md。

---

## 11. やってはいけないこと（要約）

- ユーザー依頼なしの git commit / push / amend
- secrets（`.env` 等）のコミット
- 見出しの `p`/`div` 落とし、複数 h1、階層スキップ
- 効能・断定・無根拠 No.1 の無断強化
- `:root` で足りる色・余白・見出し階層のセクション再発明
- `lp-section--dark` 対象外での黒帯上下 padding のバラ撒き
- 既存で足りるのに丸ごと新規巨大 CSS
- 「実装ついで」の無関係リファクタやドキュメント量産（本ファイル・依頼範囲以外）
- HTML コメントに LP の論理・狙い・編集意図を書かない（共感／再定義／結論、製品モード、など）。公開HTMLに残る
- セクション区切りコメントも本文 HTML には置かない。構成はクラスと本ファイルの地図、EC用は `{# lp-code-* #}` だけ（CSS 内の実装コメントは対象外）
- [`lp-code-vars.md`](lp-code-vars.md) にない `{# lp-code-* #}` の無断作成（本番未登録の変数が紛れ込む）

---

## 12. ECフォース本番変換（[`works.html`](works.html)）

**トリガー:** 「`works.html` に貼って本番変換」、`/audit`、および同等の指示。

対象は [`works.html`](works.html) 単体。本節だけを読み、そのファイルだけを直す。他の HTML は開かない（[`preview.html`](preview.html) も上書きしない）。変換スクリプトは書かない。出力は **1ファイル**。

やることは **切れ目コメント** と **パス置換** だけ。本文の文言・価格は変えない。`<title>` は [`lp-code-vars.md`](lp-code-vars.md) と一致しているか照合する（不一致は直さず報告。変更は正本更新のあと）。`<meta name="description">` は HTML に置かない（本番挿入）。

### 部分テンプレ変数

変数名・順序・巻く範囲の正本は [`lp-code-vars.md`](lp-code-vars.md)。

- そこにない `{# lp-code-* #}` は **作らない**（必要なら提案のみ。採用はユーザー確認後）
- タグを追加・改名・削除するときは、ユーザー承認のあと **`lp-code-vars.md` を先に直し**、そのあと [`works.html`](works.html) を直す
- **`<title>` / description 文言** も正本は [`lp-code-vars.md`](lp-code-vars.md)。変更はユーザー承認 → 正本を先 → `works.html` の同期箇所（`og:title` / `og:description` / Product JSON-LD 含む）を揃える。`<meta name="description">` は HTML に書かない
- `/audit` の合否も `lp-code-vars.md` を参照する（タグ・title。meta description タグは HTML に無い）
- head は `{# lp-code-head-common #}` / `{# lp-code-head-og #}` / `{# lp-code-head-product #}` / `{# lp-code-head-faq #}` / `{# lp-code-head-css #}`。`<title>` は巻かない。`{# lp-code-head #}` は使わない

### 開閉の形

```html
<!-- {# lp-code-fv #} -->
<section class="fv" …>…</section>
<!-- {# /lp-code-fv #} -->
```

記法: `{#` の直後と `#}` の直前は半角スペース。閉じは `{# /lp-code-fv #}`（`/{#` や `}` だけの閉じは不可）。`{# lp-code-* #}` 以外の説明コメントは付けない（§11）。

### 先頭コメント（DOCTYPE の直後）

[`lp-code-vars.md`](lp-code-vars.md) の「`works.html` 先頭コメント（写す形）」をそのまま使う。変数名・日本語・順序は正本と一致させる。

### パート地図（切れ目の正）

[`lp-code-vars.md`](lp-code-vars.md) のパート地図を正とする。ここには複製しない。

### パス

| 対象 | 置換後 |
|------|--------|
| `img/ファイル`（`src` / `srcset` / `data-lp-modal-src` / `og:image` / JSON-LD `image`） | `{{ file_root_path }}/lp-code/img/ファイル` |
| `css/code-lp.css` | `{{ file_root_path }}/lp-code/css/code-lp.css` |
| `js/code-lp.js` | `{{ file_root_path }}/lp-code/js/code-lp.js` |

固定差し替え（ファイル名を変える）:

- `og:image` → `{{ file_root_path }}/lp-code/img/ogimage.jpg`（FV 画像の流用禁止）
- Product の `image` → `{{ file_root_path }}/lp-code/img/json-item.jpg`（offer の `item.png` と別。正方想定）

**変換しない:** `og:url`、Google Fonts、Swiper CDN、CloudFront の追従 CTA、`official.stena.jp` の動画。

---

## クイックスタート（第三者／別ツール）

1. リポジトリを開き **この `AGENTS.md` を読む**
2. 編集は原則 [`preview.html`](preview.html) + [`css/code-lp.css`](css/code-lp.css) / [`js/code-lp.js`](js/code-lp.js) + 必要なら [`img/`](img/)
3. セクション追加 → §3〜6・§5 の順で方針確認 → HTML → shared type → 最小 CSS → reveal 登録（`js/code-lp.js`）
4. HTML/CSS変更 → §8 の [`layout-audit.mjs`](layout-audit.mjs) でPC/SP実画面を確認
5. コピー変更 → §7 点検
6. LLMO／公開前タスク → [`LLMO.md`](LLMO.md)
7. ECフォースへ出す → §12（[`works.html`](works.html)）。変数は [`lp-code-vars.md`](lp-code-vars.md)
