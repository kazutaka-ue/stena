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
| スタイル | [`css/lp-code.css`](css/lp-code.css)（`:root`・セクション CSS） |
| スクリプト | [`js/code-lp.js`](js/code-lp.js)（挙動。Swiper CDN の後に読込） |
| 画像 | [`img/`](img/) |
| 補助 | [`serve-debug.mjs`](serve-debug.mjs)（任意のローカル確認用） |
| 表示監査 | [`layout-audit.mjs`](layout-audit.mjs)（PC/SPの全ページ可読性監査。§8） |
| ECフォース | [`works.html`](works.html)（貼り付け正本。`{# lp-code-* #}` 分割。§12） |
| 実験・差分 | [`preview2.html`](preview2.html)（進行中の試作。下記「現在の作業状態」）、ほか `preview3.html` / `dif.html` 等。**本番相当・EC変換ソースは常に `preview.html`** |

バックエンド（Node API / PHP 等）の新規開発はしない。静的・効率的な HTML/CSS/JS 管理を優先する。

### 現在の作業状態（別 Cursor への引き継ぎ）

**いま触っている本線は [`preview2.html`](preview2.html)＋共有 CSS [`css/lp-code.css`](css/lp-code.css)。**  
[`preview.html`](preview.html) / [`works.html`](works.html) への反映は **依頼があるまでしない**。

| 項目 | 状態 |
|------|------|
| 対象 | `#tankSteel`（316Tiヒーロー）／`#tankCompare`（章頭・動画）／`#tankCross`（断面）／`#tankWash`（洗浄）／`#tankCraft`（職人技・工程） |
| 方針 | 参照デザインの **内容だけ** 移植。見た目は現行黒帯／`lp-band__*`／tank プリセット。工程バーのみ `.mp-craft-flow`（参照CSS） |
| 構成 | `#tankSteel`〜`#tankCraft` はコンパクトインナー（`.lp-inner--sm`）。`#tankCraft` は `lp-band--md`・背景 `#263a45` |
| クラフト行 | SP/PCとも横並び。円は `border-radius:50%`。工程バー `.mp-craft-flow`（参照サイトの矢羽バー／7列グリッド。文言は切断〜最終仕上げ） |
| 画像（`img/`） | `material-316ti-hero.jpg` / `craft-mold-revisions.jpg` / `craftsmanship.jpg` / `craft-mirror-finish.jpg` / `craft-heating-pipe.jpg` / `clean1.jpg` |
| 動画 | `https://official.stena.jp/mov/steel_bg.mp4`（章頭直下。`#nextLevel` にも同URLあり） |
| SPリード | `#tankCompare` は `lp-band--md`（SP左揃えはプリセット既定） |
| 表現 | §7。断定・「新品のまま続く」等は弱め済み |
| 監査 | `node layout-audit.mjs --page=preview2.html --capture=tankSteel,tankCompare,tankCross,tankWash,tankCraft` |
| 未着手 | craft を `preview.html`／`works.html` に同期する作業 |

`.cursor/rules/*.mdc` は本ファイルへのポインタのみ。マシン固有の [`.claude/settings.local.json`](.claude/settings.local.json) は `.gitignore` 対象で、フォルダごと渡しても他環境では無視してよい。

### 動作環境（前提条件）

- **npm install は不要。** [`layout-audit.mjs`](layout-audit.mjs) / [`serve-debug.mjs`](serve-debug.mjs) は Node.js 標準モジュールのみで動く（`package.json` なし）。Node.js 18 以降を想定（`fetch` 使用）。
- [`layout-audit.mjs`](layout-audit.mjs) はブラウザとして **Microsoft Edge** をローカルに起動して実画面を検証する。Windows / macOS / Linux の標準インストール先を自動探索するが、見つからない場合は環境変数 `EDGE_PATH` に実行ファイルパスを指定する。Edge（または互換Chromiumブラウザ）が入っていない環境では §8 の実画面監査が実行できないため、その旨をユーザーに報告する。
- ローカル確認用サーバーは [`.claude/launch.json`](.claude/launch.json)（`node serve-debug.mjs`）で起動できる。`.claude/settings.local.json` はこのマシン固有の個人設定のため `.gitignore` 対象（他環境へは渡さない）。

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
- **製品パートの暗帯**は `.lp-section--dark`（黒・`#nextLevel`以降）または `.lp-section--slate`（中間・`#steamAnswer`〜`#proof`。`--bg-slate`）。章ラッパや固有クラスに背景色を持たせない。
- **再利用UI**は固有 section 名を付けず `lp-*` にする（例: `lp-inner` / `lp-inner--sm` / `lp-carousel` / `lp-card` / `lp-modal`）。どの section からも同じクラスで使える。
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
| 6 | `.intro-hook.intro3-chapter` | `introHook` | 導入①共感：朝の喉の乾き（動画背景） |
| 7 | `.p4-chapter` ×3 | `humidBelief` / `throatDryness` / `p4ColdAir` | 導入拡張：湿度計50%のずれ／喉の乾燥／暖かさも必要 |
| 8 | `.method-compare.intro3-chapter` | `methodCompare` | 導入：温かい蒸気のスチーム式 |
| 9 | `.steam-answer` | `steamAnswer` | 製品モード起点：STENAの設計方針 |
| 10 | `.lp-section--dark` + `.lp-carousel` ×2 | steamAnswerCardsTitle / steamMaintenance | メリット／メンテ（汎用カード列・SP縦／PC横） |
| 11 | `.humid-diff` | `humidDiff` | 水滴 vs 水蒸気 |
| 12 | `.doctor-comment` | `doctorComment` | 医師コメント |
| 13 | `.steam-beyond` + `.lp-carousel` | `steamBeyond` | 我慢の時代終わり → 速さ（章内 h3） |
| 14 | `.steam-modes` | `steamModes` | 4段階モード |
| 15 | `.steam-cost` | `steamCost` | 電気代 |
| 16 | `.steam-design` | `steamDesign` | デザイン刷新 |
| 17 | `.proof` | `proof` | 実績・受賞（数字は h にしない） |
| 18 | `.tank-*`（各独立 section） | 各 tank 見出し | ステンレスタンク物語（固有トークンは CSS `:is`） |
| 19 | `.story-closing` | `storyClosing` | 製品パート締め（動画＋下コピー） |
| 20 | `.howto` | `howto` | 使い方 STEP |
| 21 | `.dry-stress` | `dryStress` | 冬の室内乾燥（暖房・肌髪・静電気・体感）。締めはスチーム式の方式説明 |
| 22 | `.recommend` | `recommend` | こんな方におすすめ（CASE） |
| 23 | `.lp-close` | `lpClose` | LP 締め（`img/lpclose_bg.jpg`） |
| 24 | `.qa` | `qa` | よくあるご質問（校閲メモ `qa-karadaki` あり） |
| 25 | `.specs` | `specs` | 仕様（校閲メモ `specs-power` あり） |
| 26 | `.footer` | — | 法定リンク／販売者／コピーライト（見出しなし） |

### 見出しまわりの直近意図（壊さない）

- 導入は **共感 → 冷気／数値 → methodCompare → steamAnswer（製品）** の1本。**同じ主張を2つのセクションで繰り返さない。**
- `methodCompare` でスチーム式を示したあと、`steamAnswer` は再宣言ではなく **STENA という製品の設計方針** を語り、直後のメリットへ渡す。
- **導入で一般論の数値グラフ・カウンターを持ち出さない。** 相対湿度の換算を静的に書く場合は**概算＋注記必須**。g/m³ カウンターやスクラブで滞在時間を消費しない。
- **暖房性能の断定はしない。** 「部屋が暖かくなる」「暖房代わり」「室温が上がる」と読める書き方は禁止（§7）。
- ただし **自社の設計思想（主観）としての「暖かさ」は可**。主語を自社に置き、性能ではなく方針として書く。
- 製品側の事実表現は **「加湿しても空気を冷やさない」「温かい蒸気のまま届ける」** の範囲に留める。
- **他方式が部屋を冷やす／熱を奪う、とは書かない。** 他方式は構造の記述に留める。
- 現在の `preview.html` 導入部は preview4 構成。`works.html` は preview をソースに再変換する（§12）。コピー確定前は §7 を再点検する。
- **オファー先行（coupon / offer / purchase を導入部より上）は確定仕様。入れ替えを提案しないこと。**
- 導入のタイポ／シーンは **`.intro3-*` / `.p4-*`**（`body.preview3.preview4`）。明帯の旧 `.intro-hook__ask` 構成には戻さない。
- **導入部にピン留め（sticky scrub）は置かない。** 導入セクションも原則 `min-height:100svh` / `height:*svh` で嵩上げしない（コンテンツ駆動）。**例外は `#introHook` 動画ヒーローのみ**（PC `60svh`。他章へ広げない）。
- `img/winter_morning.jpg` は `preview3.html` の `#introHook` 背景に限り使用可。マスク・咳を想起させる写真のため、改善・予防など身体効果の断定とは組み合わせない。
- 製品モード（黒帯）は `.steam-answer` から始める。p4 中間は `#334c6a` の intro 拡張トーン。
- `steam-beyond`: 章主題は h2、「約6倍速く」は **h3**。
- メリット／メンテ: 独立 `section` + 各自 h2。`.lp-carousel` / `.lp-card`（SP縦／PC横）。
- `dry-stress__close` / `steam-design__feature-text` / `lp-close__end`: 見た目の締めは **見出しタグ**。

---

## 4. デザインシステム（`:root`）

定義場所: [`css/lp-code.css`](css/lp-code.css) 先頭付近の `:root`。値を変えるときはここを触り、セクションごとの再発明をしない。

### 色・面

| トークン | 用途 |
|----------|------|
| `--bg` / `--bg-dark` / `--bg-slate` / `--bg-cool` | 白／黒／中間スレート（`#121c28`）／クール面 |
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

**HTML の h2/h3 と、見た目の大／中は別。** 新規セクションは上記のどれかを明示してトークンを使う。shared type セレクタ群（`css/lp-code.css` 内「shared type」コメント周辺）にクラスを足す。

### 黒帯の大／中バンド（`lp-band--*`）

製品パートの暗帯 section は必ず次のどちらかを付ける（面の色は `.lp-section--dark`＝黒／`.lp-section--slate`＝中間）。

| | 大 `lp-band--lg` | 中 `lp-band--md` |
|--|------------------|------------------|
| フォント | `--type-h-lg-*` / `--type-lead-lg-*` | `--type-h-md-*` / `--type-lead-md-*` |
| SP のリード | **中央** | **左寄せ** |
| PC のリード | 中央 | 中央 |

切り分けはこの2点だけ。中バンドに `.steam-answer__lead`（大リード）を流用しない（`.steam-design__lead` 等の中リードを使う）。

### 黒帯のタイトル領域（`lp-band__*`）

通常の黒帯 section は、固有 section 名ではなく次の共通プリセットをタイポの正本にする。

```html
<section class="lp-section--dark lp-band--md" aria-labelledby="exampleTitle">
  <header class="lp-band__head">
    <p class="lp-band__eyebrow">サブタイトル</p>
    <h2 id="exampleTitle" class="lp-band__title">セクションタイトル</h2>
    <p class="lp-band__lead">リード文</p>
  </header>
</section>
```

- `.lp-band__head` — タイトル領域の幅・中央配置（**横ガターは親セクション殻**。head 自身に `padding-inline` を付けない）
- `.lp-band__eyebrow` — 見出しではないアクセント付きサブタイトル
- `.lp-band__title` — section 主題の h2。サイズは親の `lp-band--lg / --md` で決める
- `.lp-band__lead` — リード。サイズと SP 寄せは親の `lp-band--lg / --md` で決める
- 既存の `.tank-title` / `.steam-design__title` 等を構造上残す場合も、h2 には必ず `.lp-band__title` を併記する
- 固有 section セレクタで `font-size` / `line-height` / `font-weight` / `letter-spacing` / `color` / `text-align` を上書きしない
- タイトル直下にリードがない場合は、存在しない要素を追加せず `.lp-band__title` だけ使う

**構造を維持する例外**

- `steam-answer` — 背景画像・前セクション接続・独自上下余白（横は殻と同じ `padding-inline`）
- `steam-beyond` / `tank-hero` — 章頭ヒーローの上下（`padding-block: var(--section-pad-hero)`。横は殻）
- `doctor-comment` — 人物写真を含む独自ヘッダー
- `story-closing` — 動画を先に置くが、後続タイトル／リードは `lp-band__*`
- `steamDaily` — 本文 feature は単カラム
- `tankSafety` — クール面ケースパネル＋SAFEバッジ＋交互行（SP/PCとも横並び）
- `dry-stress` — 灰色背景

例外は構造・面・上下余白に限る。横ガターは殻に寄せる。通常の h2／リードのタイポは `lp-band__title` / `lp-band__lead` を使う。

### レイアウト

| トークン | 目安 |
|----------|------|
| `--gutter` / `--gutter-lg` | 横ガター（セクション殻の `padding-inline`） |
| `--section-pad-y` | 標準セクション上下余白 |
| `--section-pad-hero` | 章頭ヒーローの上下（`padding-block` 用。左右は含めない） |
| `--content-sm` … `--content-xl` | 650 / 700 / 920 / 1040 / 1100px |
| `.lp-inner` / `.lp-inner--sm` | 内側ラッパ（幅だけ）。既定 max `--content-xl`／コンパクト max `--content`。`min(token,100%)` のみ。SP用に700を別指定しない |
| `@media (min-width:761px)` | PC 寄せの主ブレーク（`--type-scale: 1.1`） |

### 余白（縦の間隔）— `gap` ではなく margin

**縦に積むコンテンツの間隔は `gap` で取らない。`--lp-space-*` を使った margin で取る。**

`gap` は「その要素の全ての隙間」を一律に決めるため、1箇所だけ詰める・空けるができない。さらに子要素の margin と**加算**され（flex/grid の子は margin collapse もしない）、「gap＋margin の合計」で見た目が決まる状態になりやすい。実際に `margin:0` のリセットや `gap:0` / `gap:normal` の打ち消しが各所に生えていた。

| | 使う | 使わない |
|--|------|----------|
| 縦に積むコンテンツ（見出し→リード→本文→注記、パネル間、ステップ間） | `margin-top` ＋ `--lp-space-*` | `gap` |
| 2次元グリッド・カード列・表・アイコン＋テキスト等の横並びクラスタ | `gap` | — |

- スケールの正本は `:root` の `--lp-space-0` 〜 `--lp-space-10`（すべて `clamp()` の可変値）
- CSS 内では `margin-top:var(--lp-space-5)` のようにトークンを直接使う
- HTML 側で個別調整したいときは共通プリセット `.lp-mt-*` / `.lp-mb-*` / `.lp-stack-*`（`.lp-stack-N` は直下の子の2番目以降に `margin-top` を与える親クラス）
- 生の `clamp(...)` を新規に書かない。既存値に合う段がなければ**スケールに段を足してから**使う
- `display:flex` / `display:grid` 自体は禁止ではない。縦センタリングや列組みのための display はそのまま使い、**`gap` だけを margin に置き換える**
- グローバルに `*{margin:0}` が効いているので、子要素の `margin:0` は原則不要。書くと親の `> * + *` プリセットを打ち消してしまう
- 親の `> * + *` と子の個別 margin は詳細度が並ぶ。**プリセット側を子ルールより後ろに置く**（`.offer__pricing > * + *` は `.offer__lump` 等の後ろ）

`.p4-chapter` の `works.html` 未同期分や `.method-intro__*` など、現在 `preview.html` から参照されていない旧プロトタイプ CSS には `gap` が残っている。使う際に上記へ寄せる。

### セクション殻の余白（上下＋左右・必須）

コンテンツは **セクション殻が padding を持ち、その内側に載る**。リードやタイトルへ場当たりで横 padding を足さない。

```
section.lp-section / .lp-section--dark / .steam-answer
  / .intro3-chapter（導入）
  ├── padding-block: var(--section-pad-y)
  └── padding-inline: var(--gutter-lg)
        └── .lp-inner / .lp-inner--sm / .tank-inner / .intro3-scene / .p4-scene など
              └── 幅制御のみ（横・上下 padding なし）
```

1. HTML に **`lp-section--dark`**（または明帯なら `lp-section`）。製品起点の `.steam-answer`、導入の `.intro3-chapter` / `.p4-chapter` も殻として同じ余白トークンを使う
2. 暗帯の色・余白は **`.lp-section--dark`**（`background` / `color` / `padding-block` / `padding-inline`）。導入は `.intro3-chapter` が同トークン
3. **内側ラッパは幅だけ** — `.lp-inner` / `.lp-inner--sm` / `.lp-band__head` / `.intro3-scene` / `.p4-scene` / `.tank-inner` 等に `padding-inline` を付けない。新規は `lp-inner`（広い）または `lp-inner--sm`（コンパクト＝旧 `tank-inner`）。幅は `min(トークン,100%)` のみ（SPで700pxを別指定しない）
4. **子にガターを再発明しない** — タイトル・リード・注記・表・カード列へ `padding: 0 var(--gutter-lg)` を個別指定しない
5. **画面端まで出したい要素だけ** — 共通 `.lp-bleed`（負マージンで殻の inline を打ち消す）。`#introHook` の背景動画はセクション基準の `position:absolute; inset:0` で full-bleed
6. セクション CSS に上下・左右 padding や黒背景の個別指定を足さない（章固有の例外を除く）
7. **高さはコンテンツ駆動** — 導入・`.lp-story-panel` に `min-height:100svh` / `height:*svh` でセクションを嵩上げしない

**例外（個別維持）**

- `steam-answer` — 前セクション接続 + min-height（上下は独自。横は殻と同じ `padding-inline`）
- `tank-hero` / `steam-beyond` — 章頭ヒーロー。上下は `padding-block: var(--section-pad-hero)`（`padding` ショートハンドで左右を潰さない）
- 導入の `.intro3-chapter` / `.p4-chapter` は殻と同じ `--section-pad-y` / `--gutter-lg`（コンテンツ駆動の高さ）
- `#introHook` のみ動画ヒーロー例外 — 殻 padding なし。`.intro3-scene` に旧パディングと PC `height:60svh`（他導入章へ横展開しない）
- `lp-close` — full-bleed 画像ヒーロー（殻パディング対象外）

新規例外が必要ならユーザー確認後。値変更は `--section-pad-y` / `--gutter-lg` を優先。

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

### 画像｜テキスト行（共通プリセット）

- **常時横並び（SP/PC）** — `.lp-feature`（必要なら `.steam-design__feature` を併記してメディア／余白を流用）。列比は `--lp-feature-cols`、間隔は `--lp-feature-gap`。
- **SP縦／PC横** — 素の `.steam-design__feature`（従来どおり）。
- **縦積み例外** — `#steamDaily`（PCも単カラム）。
- `#steamDesign` は現状 SP も横並び（ID上書き）。新規は `.lp-feature` を優先。`#…` で列比を再発明しない。

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
| 熱を届ける／暖房代わり | 温かい蒸気のまま届ける／加湿しても空気を冷やさない |

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
- 章内sceneは必要に応じて `.lp-story-panel` + `data-layout-panel` とし、要素へ `data-type-role="main|lead|support|evidence|observation|close"` を付ける。`main` は各panelに必ず1つだけ置く。**`.lp-story-panel` に `min-height:100svh` は付けない**（監査用マーカー。高さはコンテンツ＋セクション殻パディング）。
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
node layout-audit.mjs --capture=introHook,methodCompare,p4ColdAir
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

### 同じクラスの連続 `p`

**同じクラスの連続する `<p>` は分けない。** 1つの `<p>` にまとめ、行区切りは `<br>`（必要なら `.br-sp` / `.br-pc`）で取る。

- 対象: `.p4-body` / `.intro3-lead` / 同役割の本文・リードなど、見た目もクラスも同じ塊
- 例外: 引用（`.p4-quote`）・注記（`.p4-note`）・図キャプションなど、役割が違う要素は別タグのまま
- 画像や別ブロックで挟まれた前後は別 `p` でよい

### 日本語の折返し（`word-break` / `text-wrap`）

正本は `css/lp-code.css` 先頭のリセット直後にある1ルールのみ。**セクションごとに折返しを再指定しない。**

```css
p,li,dd,dt,figcaption,small,strong,blockquote,
h1,h2,h3,h4,h5,h6{ text-wrap:pretty; }
```

- **`word-break:auto-phrase` は使わない。** Chromium ＋ `lang="ja"` 限定で、iOS Safari では効かない。「どこで折るか」を言語規則で変えるプロパティなので、対応／非対応で別の組版になり、Edge で回す [`layout-audit.mjs`](layout-audit.mjs) では iPhone 実機の結果を検証できない。幅が少し変わるだけで切れ目が文節ひとつ分ジャンプし、1行目が大きく余る事故が起きる
- **`text-wrap:pretty` は可。** 折る位置の規則は変えず、最終行が1〜2文字だけになるのを避けるだけ。非対応ブラウザでは何も起きないため機種差で意味が食い違わない（SP390px 実測で孤立最終行 19件 → 6件、1文字の孤立はゼロ）
- **`text-wrap:balance` は現在不使用。** 見出しの行長を揃える効果はあるが、幅による振れ幅が大きいため使わない
- 熟語が行末で割れるのは日本語組版として正常。1文字ずつ `<br>` で潰さない
- 狙った改行は `.br-sp` / `.br-pc` で明示する（§9「SP 改行」）
- 局所的にどうしても分割を止めたいときだけ `word-break:keep-all`

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
| [`CLAUDE.md`](CLAUDE.md) | Claude Code 用の薄いポインタ（内容は本ファイル） |

構造化データ（Product / FAQPage）や `og:*` の本番差し替えは **LLMO.md の手順に従い、本文表示と JSON-LD を同時更新**すること。価格は Product スキーマに載せない（LP と差が出るため）——詳細は LLMO.md。

---

## 11. やってはいけないこと（要約）

- ユーザー依頼なしの git commit / push / amend
- secrets（`.env` 等）のコミット
- 見出しの `p`/`div` 落とし、複数 h1、階層スキップ
- 効能・断定・無根拠 No.1 の無断強化
- `:root` で足りる色・余白・見出し階層のセクション再発明
- 縦に積むコンテンツの間隔を `gap` で取る（§4「余白」）。`--lp-space-*` の margin を使う
- 子要素への不要な `margin:0`（グローバル `*{margin:0}` と重複し、親の余白プリセットを殺す）
- `lp-section--dark` 対象外での黒帯上下 padding のバラ撒き
- 横ガターをリード／タイトル／注記／カードなど子に再発明する（正本はセクション殻の `padding-inline`）
- `.lp-inner` 等の内側ラッパに `padding-inline` を付ける（幅制御だけにする）
- 導入・`.lp-story-panel` を `min-height:100svh` / `height:*svh` で嵩上げする（高さはコンテンツ駆動）
- 既存で足りるのに丸ごと新規巨大 CSS
- 「実装ついで」の無関係リファクタやドキュメント量産（本ファイル・依頼範囲以外）
- HTML コメントに LP の論理・狙い・編集意図を書かない（共感／再定義／結論、製品モード、など）。公開HTMLに残る
- セクション区切りコメントも本文 HTML には置かない。構成はクラスと本ファイルの地図、EC用は `{# lp-code-* #}` だけ（CSS 内の実装コメントは対象外）
- [`lp-code-vars.md`](lp-code-vars.md) にない `{# lp-code-* #}` の無断作成（本番未登録の変数が紛れ込む）

---

## 12. ECフォース本番変換（[`works.html`](works.html)）

**トリガー:** 「`works.html` に貼って本番変換」、`/audit`、および同等の指示。

**ソース:** 本文の正本は [`preview.html`](preview.html)。変換時は preview を読み、切れ目コメントとパス置換を施した **1ファイル [`works.html`](works.html)** を出力する。変数名・巻く範囲の正本は [`lp-code-vars.md`](lp-code-vars.md)（preview のセクション地図に合わせて更新する）。

やることは **切れ目コメント** と **パス置換** だけ。本文の文言・価格は preview から持ち込み、変換作業中に勝手に変えない。`<title>` は [`lp-code-vars.md`](lp-code-vars.md) と一致しているか照合する（不一致は直さず報告。変更は正本更新のあと）。`<meta name="description">` は HTML に置かない（本番挿入）。
- head 同期時は [`LLMO.md`](LLMO.md) の「構造化データの立証チェック」に従い、本文で立証できない語（例：高い安全性・自動洗浄・静音）が Product / `og:description` に残っていないか確認し、あれば**警告して完了扱いにしない**。
- `body` には preview と同じく `preview3 preview4` を付ける（導入 CSS が依存）。`data-fix-cta-after` も preview に合わせる。

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
| `css/lp-code.css` | `{{ file_root_path }}/lp-code/css/lp-code.css` |
| `js/code-lp.js` | `{{ file_root_path }}/lp-code/js/code-lp.js` |

固定差し替え（ファイル名を変える）:

- `og:image` → `{{ file_root_path }}/lp-code/img/ogimage.jpg`（FV 画像の流用禁止）
- Product の `image` → `{{ file_root_path }}/lp-code/img/json-item.jpg`（offer の `item.png` と別。正方想定）

**変換しない:** `og:url`、Google Fonts、Swiper CDN、CloudFront の追従 CTA、`official.stena.jp` の動画。

---

## 13. 問題点レビュー（トリガー: 「問題点を上げて」）

**トリガー:** 「（このフォルダ／このファイルの）問題点を上げて」、および同等の指示。対象は指示で明示されたファイル（省略時は直近で作業していたHTML）。

本文の文言・タグ構造は変更しない。該当セクションの**直後**（意味のまとまりを壊さない位置）に、**ブラウザ上で視認できる校閲メモ**を挿入するだけに留める（HTMLコメントは不可。コンテンツライターが実際のページを見て気づける形にする）。反映（コピー修正の実適用）はユーザー承認後、別途行う。

**対象範囲：一般ユーザーの目に見えるコンテンツのみ。** `<meta>` / OGP / JSON-LD 構造化データ / `<title>` / コメント設計など、コーディング・実装側の事項は対象外（コンテンツライターの確認範囲外のため。値の差し替え漏れ等は別途通常の実装レビューで扱う）。見出し（h1〜h3等）や本文コピーなど、画面に表示される文言・構成のみを点検する。

**判断の核（重要）：表現の型・文体そのものに縛りはない。** 判断基準は「そのコンテンツに科学的・事実的根拠があるか」の一点。根拠がない、または根拠と矛盾すると判断されるコンテンツを作らない／作ってしまった場合にのみ警告する。既存の編集方針（§3等）の言い回しと単に一致しない、というだけでは警告理由にならない（出典明記・妥当な計算・裏付けがあれば、方針の文言と表面上ズレて見えても警告しない）。

**出力条件：そのコンテンツの修正または削除が実際に必要な場合のみ警告する。** 「念のため確認を」「他箇所と合わせて確認するとよい」など、対応が任意・条件付きの所感は出力しない。裏付けの有無を検証し、裏付けがあると判断できるものは警告対象にしない。

### 出力形式

装飾付き `<div>` を該当箇所の直後に挿入する（既存の校閲メモと同じ見た目で統一。危険度「高」は赤系、それ以外は黄系）。

```html
<div data-review-note="（セクションidなど識別用）" style="margin:20px 0 0;padding:16px 18px;border:2px dashed #d97706;border-radius:8px;background:#fffbeb;color:#78350f;font-size:14px;line-height:1.8;text-align:left;">
  <p style="margin:0 0 10px;font-weight:700;font-size:13px;letter-spacing:.05em;color:#b45309;">【校閲メモ｜公開前に必ず削除してください】</p>
  <p style="margin:0 0 8px;">種別: 薬機法・景品表示法 ｜ 危険度: 高</p>
  <p style="margin:0 0 8px;">指摘: （何がどう引っかかるか、根拠となる語句を引用）</p>
  <p style="margin:0;">判定: 改善可能 → 提案: （§7「差し替えの型」に倣った具体代替コピー。原案の訴求方向を極力維持）</p>
</div>
```

危険度「高」または「要メーカー確認」を伴う場合は赤系（`border:#dc2626` / `background:#fef2f2` / `color:#7f1d1d` / ラベル色 `#b91c1c`）に差し替える。

改善不可の場合は「判定: 改善困難 → 警告: （理由。構成ごと見直しが必要な旨）」とし、無難な代替案を勝手に採用しない。

### 点検観点（種別）

危険度の目安は 1 > 3 > 4 > 5 > 2 だが、実害（公開後の指摘リスク・炎上リスク）で並び替えてよい。各指摘に危険度（高／中／低）を付ける。

1. **薬事法・薬機法・景品表示法** — §7 の観点をそのまま適用（絶対断定・他社否定・医療効能・優良誤認・効果保証）。法令上の要修正・削除に該当する場合のみ。
2. **検索評価（SEO）** — 見出し構造（§6）の階層崩れなど、放置すると評価を損なう実害がある場合のみ（画面に表示される見出し・本文のみが対象。`<meta>`/JSON-LD等の実装側は対象外）
3. **科学的矛盾点** — 数値・原理説明が内部で矛盾している、または根拠となる裏付けがない因果関係を断定している場合。出典・計算根拠があり整合しているものは対象外。
4. **コンテンツの矛盾** — 章同士で両立しない事実主張をしている場合（単なる表現・言い回しの違いは対象外。事実として矛盾するものだけ）
5. **全体との整合性** — トーン・構成の違いが、読者に事実と異なる印象を与えかねない場合のみ。単なる文体・好みの違いは対象外。

### 判定基準

- **改善可能**（表現を変えるだけで法令順守・根拠の整合を保ちつつ元の狙い・魅力を維持できる）→ 具体的な代替コピー案を提案。厳しくしすぎてLPの訴求力を削らない範囲で、原案の方向性を極力活かす。
- **改善困難**（表現を変えても本質的に成立しない、または構成ごと変える必要がある）→ 警告のみに留め、代替案の断定的な採用はしない。

### 注意

- 注釈の見出し文言「【校閲メモ｜公開前に必ず削除してください】」は固定（後から grep・目視で拾いやすくするため）。
- 複数ファイルにまたがる指摘は、ファイルごとに分けて出す。
- この節は §7（表現リスク自己点検）を包含する運用トリガー。§7 の判断基準自体はそのまま使う。

---

## クイックスタート（第三者／別ツール）

1. リポジトリを開き **この `AGENTS.md` を読む**（特に §1「現在の作業状態」）
2. **進行中の試作**は [`preview2.html`](preview2.html) + [`css/lp-code.css`](css/lp-code.css)。**本番相当**は [`preview.html`](preview.html)（依頼なく混ぜない）
3. セクション追加 → §3〜6・§5 の順で方針確認 → HTML → shared type → 最小 CSS → reveal 登録（`js/code-lp.js`）
4. HTML/CSS変更 → §8 の [`layout-audit.mjs`](layout-audit.mjs) でPC/SP実画面を確認（preview2 なら `--page=preview2.html`）
5. コピー変更 → §7 点検
6. LLMO／公開前タスク → [`LLMO.md`](LLMO.md)
7. ECフォースへ出す → §12（[`works.html`](works.html)）。変数は [`lp-code-vars.md`](lp-code-vars.md)。ソースは **preview.html のみ**
8. 「問題点を上げて」指示 → §13（校閲メモをHTMLに挿入。本文は書き換えない）
