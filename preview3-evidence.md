# Preview3 導入部 — 根拠コーパス／主張台帳

調査日: 2026-08-28

本資料は `preview3.html` の導入コピーを作るための編集用台帳であり、法的適合を保証するものではない。一般的な科学情報と STENA 固有の効果は分けて扱い、一般論を製品効能の根拠に転用しない。

## 判定区分

- **掲載可能** — 出典の適用範囲を超えず、構造・物理現象として説明できる
- **条件付き** — 条件や概算であることを本文付近に明示する
- **製品訴求へ接続不可** — 一般的知識としては正しくても、STENA の効能として扱わない
- **撤回** — 現在の表現を裏付けられない、または誤解を生むため使用しない

## 1. 室内の相対湿度

### 根拠

- 厚生労働省「建築物環境衛生管理基準について」  
  https://www.mhlw.go.jp/bunya/kenkou/seikatsu-eisei10/index.html
- e-Gov 法令検索「建築物における衛生的環境の確保に関する法律施行令」  
  https://laws.e-gov.go.jp/law/345CO0000000304/

空気調和設備を設けた特定建築物の居室では、相対湿度 40％以上70％以下が環境管理基準とされている。

### 適用範囲

これは特定建築物の衛生管理基準であり、一般住宅の寝室や「喉に適した湿度」を直接示す基準ではない。

### 判定

- 「相対湿度は温度と組み合わせて読む」: **掲載可能**
- 「公的な環境管理基準では40〜70％」: **条件付き**。特定建築物の基準であることを併記する
- 「喉にいい湿度は50％前後」: **撤回**。上記資料からは導けない

## 2. 温度変化と相対湿度

### 根拠

- World Meteorological Organization, *Guide to Instruments and Methods of Observation (WMO-No. 8)*, Volume I, Annex 4.B  
  https://community.wmo.int/site/knowledge-hub/programmes-and-initiatives/instruments-and-methods-of-observation-programme-imop/guide-instruments-and-methods-of-observation-wmo-no-8
- Wexler A. “Vapor Pressure Formulation for Water in Range 0 to 100°C.” *Journal of Research of the National Bureau of Standards*. 1976;80A(5–6):775–785.  
  DOI: https://doi.org/10.6028/jres.080A.071

WMO-No. 8 は、水面に対する飽和水蒸気圧を次式で示している。

`ew(t) = 6.112 × exp(17.62t / (243.12 + t))`

相対湿度は `U = 100 × e / ew(t)`。水蒸気を加えず空気を温める仮定では実際の水蒸気圧 `e` を一定として計算する。

### Preview3で使う計算例

- 初期条件: 12℃・相対湿度50％
- 水蒸気を加えず22℃まで温める
- 計算結果: 相対湿度 約26.5％（表示は「約27％」）

参考として同じ仮定で37℃まで温めると約11.2％になるが、これは人体内の湿度を表す値ではない。

### 判定

- 「水蒸気量が同じなら、空気を温めると相対湿度は下がる」: **掲載可能**
- 「12℃・50％ → 22℃・約27％」: **条件付き**。水分を加えない仮定上の概算と近接表示する
- 「体内での実質湿度12％」: **撤回**

## 3. 鼻・気道による吸気の加温加湿

### 根拠

- Keck T, Lindemann J. “Numerical simulation and nasal air-conditioning.” *GMS Current Topics in Otorhinolaryngology - Head and Neck Surgery*. 2010;9:Doc08.  
  DOI: https://doi.org/10.3205/cto000072
- Keck T et al. “Humidity and temperature profile in the nasal cavity.” *Rhinology*. 2000;38:167–171.  
  https://www.rhinologyjournal.com/Rhinology_issues/55.pdf
- Wolf M, Naftali S, Schroter RC, Elad D. “Air-conditioning characteristics of the human nose.” *The Journal of Laryngology & Otology*. 2004;118(2):87–92.  
  DOI: https://doi.org/10.1258/002221504772784504
- Lin C-L et al. “A Numerical Study of Heat and Water Vapor Transfer in MDCT-Based Human Airway Models.” *Annals of Biomedical Engineering*. 2014;42(10):2117–2131.  
  DOI: https://doi.org/10.1007/s10439-014-1074-9

健康成人23人を対象としたKeckらの測定では、25±1℃・相対湿度35±2％の環境で、吸気終末の鼻咽腔は32.6±1.5℃・相対湿度90.3±5.3％だった。レビューでも、吸気の加温・加湿は主に鼻腔で行われ、鼻咽頭付近でおよそ31〜34℃、相対湿度90〜95％に達すると整理されている。下気道でも調整は続く。

### 適用範囲

呼吸器の一般的な生理機能を説明する文献であり、家庭用加湿器による症状改善や予防効果を検証したものではない。

### 判定

- 「吸い込んだ空気は、主に鼻腔で加温・加湿される」: **製品訴求へ接続不可**
- 「足りない水分を喉から補う」: **撤回**。鼻腔を中心とする調整過程を単純化しすぎている
- 「喉の水分が奪われる」: **撤回**。条件なしの断定および製品効果の暗示につながる
- 人体図・呼吸生理の説明: **内部根拠としてのみ保持**。商品LP内では一般論であっても製品の身体効果を暗示し得るため、Preview3の公開コピーには掲載しない

## 4. 加湿方式

### 根拠

- 製品評価技術基盤機構（NITE）「熱い蒸気と内部の湯に注意〜知って防ごう加湿器の事故〜」  
  https://www.nite.go.jp/jiko/chuikanki/press/2021fy/prs220127.html
- NITE 発表資料「加湿器の事故を防ぐポイント」  
  https://www.nite.go.jp/data/000131937.pdf

NITE は、スチーム式を「水をヒーターで加熱し、蒸気にして室内に放出」、超音波式を「水を超音波振動で微細な霧にして室内に放出」と説明している。

### 判定

- 上記の構造差: **掲載可能**
- 「スチーム式は加湿時に空気を冷やさない」: **条件付き**。方式上の説明に限定し、暖房効果へ広げない
- 「純粋な蒸気」「完全に清潔」「殺菌された蒸気」: **撤回**。無条件の衛生保証として使用しない
- 他方式の性能・衛生性を否定する比較: **撤回**

## 5. 広告表現の境界

### 根拠

- 静岡県「広告・表示を行う方へ」  
  https://www.pref.shizuoka.jp/kenkofukushi/eiseiyakuji/yakuji/1003159/1025361.html
- e-Gov 法令検索「医薬品、医療機器等の品質、有効性及び安全性の確保等に関する法律」  
  https://laws.e-gov.go.jp/law/335AC0000000145
- 消費者庁「不実証広告規制」  
  https://www.caa.go.jp/policies/policy/representation/fair_labeling/representation_regulation/misleading_representation/not_demonstrated_ad

公的案内では、雑貨品に医薬品的・医療機器的な効能効果を標ぼうすることも、未承認医薬品等の広告に該当し得るとされている。また、表示された効果・性能と提出資料の実証内容が適切に対応していなければ、景品表示法上の合理的根拠とは認められない。

### Preview3の運用

- 疾病の治療・予防、症状の改善、身体機能の増強をSTENAの効果として書かない
- 一般論の査読文献を、STENA固有の効果を示す根拠に使わない
- 「個人差があります」等の打消し表示で強い効能表現を正当化しない
- 製品固有の数値・性能は、製品試験資料と表示内容が一致する場合だけ掲載する

## 6. Preview3で採用する主張

1. 相対湿度は、その温度における水蒸気量の割合である
2. 水蒸気を加えず空気だけを温めると、相対湿度は下がる
3. 12℃・50％の空気を水分量一定のまま22℃まで温めると、計算上は約27％になる
4. 湿度計の相対湿度はセンサー周辺の室内空気を示し、身体の中の湿度を示す値ではない
5. 暖房と加湿は、それぞれ室温と水蒸気量を整える別の働きである
6. 超音波式は水を微細な霧として、スチーム式は水を加熱して蒸気として放出する
7. STENAはスチーム式を採用している
8. スチーム式は加湿時に空気を冷やさない。暖房器具としての効果は標ぼうしない

## 7. Preview3で使用しない主張

- 喉にいい湿度は50％
- 室内湿度50％でも体内では12％
- 足りない水分を喉から補う
- STENAが喉の乾燥や不快感を防ぐ・改善する
- STENAが寝室や身体を暖める
- スチーム式なら清潔・安全・快適が保証される
- 文献上の一般論を、STENAで再現できる効果として扱う
