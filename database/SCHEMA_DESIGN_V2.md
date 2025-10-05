# 📊 BESS Site Survey System - Database Schema v2.0

## 概要

正規化された拡張可能なデータベーススキーマ。自動化レベル（AUTO/SEMI/MANUAL）を明示し、将来の機能拡張に対応。

---

## 🎯 設計方針

### 1. 正規化と分離

- **機能単位でテーブル分離**: grid/geo/regulatory/access/economics
- **主キー**: すべて `id` (UUID)
- **自然キー**: `sites.site_code` (人間可読ID: STB2025-000001)
- **外部キー**: すべてのテーブルが `site_id` で `sites` に紐付く

### 2. 自動化レベルの明示

すべての属性テーブルに `automation_level` フィールド：

- **AUTO**: 完全自動取得（API/計算）
- **SEMI**: 半自動（機械取得 → 人手レビュー）
- **MANUAL**: 手動入力

### 3. 監査性と再現性

- **automation_sources**: データ取得元とリフレッシュ管理
- **audit_log**: すべての変更履歴
- **scores.formula_version**: スコア計算式の版管理

---

## 📋 テーブル構成

### 1. sites（候補地点の基本台帳）

**役割**: インポート起点。住所 + 緯度経度（農地青地・ハザード除外済）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| site_code | TEXT | 人間可読ID（例: STB2025-000001） |
| name | TEXT | 任意の表示名 |
| address | TEXT | 住所（インポート元） |
| lat | DOUBLE PRECISION | 緯度 |
| lon | DOUBLE PRECISION | 経度 |
| area_m2 | NUMERIC | 面積 |
| land_right_status | TEXT | 所有/賃貸/交渉中 |
| status | TEXT | draft/under_review/approved/rejected |
| priority_rank | TEXT | A/B/C等 |

**インデックス**:
- `idx_sites_latlon`: 地理検索
- `idx_sites_status`: ステータスフィルタ
- `idx_sites_code`: site_code検索

---

### 2. grid_info（系統/電力系データ）

**役割**: 空容量、変電所距離、接続コスト等

| カラム | 型 | 自動化 | 説明 |
|--------|-----|--------|------|
| site_id | UUID | - | 外部キー |
| target_voltage_kv | NUMERIC | MANUAL | 66/77/154/275 etc |
| substation_distance_m | NUMERIC | AUTO | 変電所距離 |
| line_distance_m | NUMERIC | AUTO | 送電線距離 |
| capacity_available_mw | NUMERIC | SEMI | 空き容量MW |
| congestion_level | TEXT | SEMI | low/medium/high |
| connection_cost_jpy | NUMERIC | MANUAL | 接続コスト試算 |
| reinforcement_plan | TEXT | MANUAL | 将来増強計画メモ |
| automation_level | TEXT | - | AUTO/SEMI/MANUAL |

**自動化ロジック**:
- `substation_distance_m`: 変電所座標DBから最近傍距離計算（Haversine）
- `capacity_available_mw`: 電力会社PDF/CSV → n8nで抽出 → 人が補正（SEMI）
- `connection_cost_jpy`: 見積/実務ナレッジ入力（MANUAL）

---

### 3. geo_risk（地理リスク）

**役割**: ハザード/標高/勾配等

| カラム | 型 | 自動化 | 説明 |
|--------|-----|--------|------|
| site_id | UUID | - | 外部キー |
| elevation_m | NUMERIC | AUTO | 標高 |
| slope_pct | NUMERIC | AUTO | 勾配(%) |
| flood_depth_class | TEXT | AUTO | 0.5m未満/2m未満/5m超 |
| liquefaction_risk | TEXT | SEMI | 低/中/高 |
| sun_hours_loss | NUMERIC | AUTO | 影の影響率 |
| automation_level | TEXT | - | AUTO/SEMI/MANUAL |

**自動化ロジック**:
- `elevation_m` / `slope_pct`: Google Elevation API + DEM
- `flood_depth_class`: 国土地理院ハザードタイル重ね合わせ
- `sun_hours_loss`: Google Solar API

---

### 4. land_regulatory（法規制）

**役割**: 都市計画/用途/条例等

| カラム | 型 | 自動化 | 説明 |
|--------|-----|--------|------|
| site_id | UUID | - | 外部キー |
| city_plan_zone | TEXT | SEMI | 市街化調整/非線引き |
| land_use_zone | TEXT | SEMI | 用途地域 |
| farmland_class | TEXT | SEMI | 農振除外/白地/保全 |
| cultural_env_zone | TEXT | SEMI | 文化財/保護区域 |
| park_landscape_zone | TEXT | SEMI | 自然公園/風致 |
| local_ordinances | TEXT | MANUAL | 自治体独自規制 |
| build_restrictions | TEXT | MANUAL | 建築/開発許可 |
| automation_level | TEXT | - | AUTO/SEMI/MANUAL |

**自動化ロジック**:
- `city_plan_zone` / `land_use_zone`: 国土数値情報/自治体GIS → 重ね合わせ → 人が補正
- `local_ordinances`: 自治体条文の読替・要点を手入力

---

### 5. access_physical（物理条件）

**役割**: アクセス道路/形状/面積等

| カラム | 型 | 自動化 | 説明 |
|--------|-----|--------|------|
| site_id | UUID | - | 外部キー |
| parcel_shape | TEXT | SEMI | 長方形/不整形 |
| road_access | TEXT | SEMI | 有/無 + 幅員m |
| nearest_road_width_m | NUMERIC | SEMI | 最寄り道路幅員 |
| inside_setback_need | TEXT | SEMI | 要/不要/不明 |
| neighbor_clearance_e | NUMERIC | MANUAL | 東側離隔(m) |
| neighbor_clearance_w | NUMERIC | MANUAL | 西側離隔(m) |
| neighbor_clearance_n | NUMERIC | MANUAL | 北側離隔(m) |
| neighbor_clearance_s | NUMERIC | MANUAL | 南側離隔(m) |
| automation_level | TEXT | - | AUTO/SEMI/MANUAL |

**自動化ロジック**:
- `road_access` / `nearest_road_width_m`: OSM道路中心線 + タグから幅員近似 → 現地/ストリートビューで補正
- `parcel_shape`: 地番ポリゴン取得できれば自動、無ければ手動分類

---

### 6. economics（経済性）

**役割**: 用地価格/賃料/接続・工事コスト等

| カラム | 型 | 自動化 | 説明 |
|--------|-----|--------|------|
| site_id | UUID | - | 外部キー |
| land_price_jpy_per_m2 | NUMERIC | SEMI | 地価（円/m²） |
| land_rent_jpy_per_tsubo_month | NUMERIC | MANUAL | 賃料（円/坪/月） |
| connection_cost_estimate_jpy | NUMERIC | MANUAL | 接続コスト試算 |
| construction_cost_estimate_jpy | NUMERIC | MANUAL | 工事コスト試算 |
| planned_power_mw | NUMERIC | MANUAL | 計画出力(MW) |
| planned_energy_mwh | NUMERIC | MANUAL | 計画容量(MWh) |
| expected_capacity_factor_pct | NUMERIC | AUTO | 稼働率 |
| automation_level | TEXT | - | AUTO/SEMI/MANUAL |

**自動化ロジック**:
- `land_price_jpy_per_m2`: 相場クロール可だが最終は交渉/見積反映
- `expected_capacity_factor_pct`: 日照時間・気象データから自動計算

---

### 7. automation_sources（データ取得元管理）

**役割**: 取得元API/URL/PDFとリフレッシュ管理

| カラム | 型 | 説明 |
|--------|-----|------|
| site_id | UUID | 外部キー |
| table_name | TEXT | 例: 'geo_risk' |
| field_name | TEXT | 例: 'elevation_m' |
| source_type | TEXT | API/PDF/CSV/Manual/Scraper |
| source_name | TEXT | Google Elevation API 等 |
| source_url | TEXT | 参照URL or ファイルパス |
| last_refreshed_at | TIMESTAMP | 最終更新日時 |
| refresh_interval_hours | INT | 自動更新間隔 |
| parser_version | TEXT | スクレイパー/ワークフロー版 |

**用途**:
- データの出典を記録
- 自動更新のスケジュール管理
- 監査性と再現性の担保

---

### 8. scores（スコア・優先度）

**役割**: 自動スコア計算と優先度付け

| カラム | 型 | 説明 |
|--------|-----|------|
| site_id | UUID | 外部キー |
| score_total | NUMERIC | 総合スコア |
| score_grid | NUMERIC | 系統スコア |
| score_geo | NUMERIC | 地理リスクスコア |
| score_regulatory | NUMERIC | 法規制スコア |
| score_access | NUMERIC | アクセススコア |
| score_economics | NUMERIC | 経済性スコア |
| grade | TEXT | A/B/C/D/F |
| formula_version | TEXT | スコア式の版管理 |
| calculated_at | TIMESTAMP | 計算日時 |

**スコア計算例**:

```
score_grid = (空容量>閾値) + (距離<閾値) + (混雑=low)
score_geo = (浸水=低) + (勾配<3%) + (標高適正)
score_regulatory = (市街化調整=可) − (保全/規制強=減点)
score_access = (幅員>=4m) + (形状=長方形)
score_economics = (接続/工事コスト<目標) + (地代妥当)

score_total = 重み付け合計
grade = A/B/C/D/F
```

---

### 9. audit_log（監査ログ）

**役割**: すべての変更履歴

| カラム | 型 | 説明 |
|--------|-----|------|
| site_id | UUID | 外部キー |
| actor | TEXT | 更新者（ユーザ or バッチ） |
| table_name | TEXT | 変更されたテーブル |
| field_name | TEXT | 変更されたフィールド |
| old_value | TEXT | 変更前の値 |
| new_value | TEXT | 変更後の値 |
| changed_at | TIMESTAMP | 変更日時 |

---

## 🔄 データフロー

### 1. インポート時（初期ジョブ）

```
1. sites 作成（住所/緯度経度/面積）
   ↓
2. geo_risk: 標高/勾配/浸水/日照損失の自動取得
   → automation_sources 記録
   ↓
3. grid_info: 送電線/変電所距離の自動計算
   空容量は「保留（SEMI）」でプレースホルダ
   ↓
4. land_regulatory: 市街化/用途/農地は自動タグ付け（SEMI）
   条例は空欄（MANUAL）
   ↓
5. access_physical: 道路/幅員は暫定推定（SEMI）
   ↓
6. scores: v1式で即時計算、grade を A/B/C 付与
```

### 2. レビュー・補正

```
1. GUIでSEMIフィールドに「要レビュー」バッジ表示
   ↓
2. ユーザーが確認・補正
   ↓
3. automation_level を SEMI → MANUAL に変更
   ↓
4. audit_log に変更履歴記録
```

### 3. 定期更新

```
1. automation_sources の refresh_interval_hours を確認
   ↓
2. n8nワークフローで自動更新
   ↓
3. updated_from_source_at を更新
   ↓
4. scores を再計算
```

---

## 🎨 GUI表示

### フィールドごとのバッジ

- **AUTO**: 🟢 自動取得
- **SEMI**: 🟡 要レビュー
- **MANUAL**: 🔵 手動入力

### サイト一覧

```
| site_code | name | grade | status | priority_rank |
|-----------|------|-------|--------|---------------|
| STB2025-000001 | 〇〇市△△町 | A | approved | A |
| STB2025-000002 | ××市□□町 | B 🟡 | under_review | B |
```

🟡 = SEMIフィールドが未レビュー

---

## 📊 スコア式管理

スコア式は別ファイル（YAML/JSON）で版管理：

```yaml
version: "1.0"
weights:
  grid: 0.30
  geo: 0.25
  regulatory: 0.20
  access: 0.15
  economics: 0.10

grid_formula:
  - condition: capacity_available_mw > 2
    points: 30
  - condition: substation_distance_m < 1000
    points: 20
  - condition: congestion_level == 'low'
    points: 10

# ... 他のスコア式
```

---

## 🔧 マイグレーション

### 既存データからの移行

```sql
-- 既存の sites テーブルから新しい sites テーブルへ
INSERT INTO sites (site_code, name, address, lat, lon, area_m2, status)
SELECT 
    'STB2025-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0'),
    site_name,
    address,
    ST_Y(location::geometry),
    ST_X(location::geometry),
    area_sqm,
    status
FROM old_sites;

-- 既存の evaluations から scores へ
INSERT INTO scores (site_id, score_total, score_grid, grade, formula_version)
SELECT 
    s.id,
    e.total_score,
    e.grid_score,
    e.recommendation,
    'v1.0'
FROM old_evaluations e
JOIN sites s ON s.site_code = 'STB2025-' || LPAD(e.site_id::TEXT, 6, '0');
```

---

## 📝 次のステップ

1. ✅ スキーマ作成（002_normalized_schema.sql）
2. ⏳ n8nワークフロー作成（自動データ取得）
3. ⏳ スコア計算エンジン実装
4. ⏳ GUI実装（バッジ表示・レビュー機能）
5. ⏳ 既存データマイグレーション

---

## 🔗 関連ドキュメント

- [マイグレーションSQL](./migrations/002_normalized_schema.sql)
- [スコア計算式](../docs/SCORING_FORMULA.md)（作成予定）
- [自動化ロジック](../docs/AUTOMATION_LOGIC.md)（作成予定）
- [n8nワークフロー](../docs/N8N_WORKFLOWS.md)（作成予定）
