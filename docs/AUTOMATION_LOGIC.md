# 🤖 自動化ロジックガイド

## 概要

BESS Site Survey System v2.0では、データ取得を3つの自動化レベルで管理します：

- **AUTO**: 完全自動取得（API/計算）
- **SEMI**: 半自動（機械取得 → 人手レビュー）
- **MANUAL**: 手動入力

---

## 📊 自動化レベル別フィールド一覧

### AUTO（完全自動）

| テーブル | フィールド | 取得方法 | API/ソース | 更新頻度 |
|---------|-----------|---------|-----------|---------|
| geo_risk | elevation_m | Google Elevation API | `https://maps.googleapis.com/maps/api/elevation` | 初回のみ |
| geo_risk | slope_pct | DEM計算 | 標高データから傾斜算出 | 初回のみ |
| geo_risk | flood_depth_class | 国土地理院ハザードタイル | `https://disaportaldata.gsi.go.jp` | 初回のみ |
| geo_risk | sun_hours_loss | Google Solar API | `https://solar.googleapis.com/v1/buildingInsights` | 初回のみ |
| grid_info | substation_distance_m | 変電所座標DB | Haversine距離計算 | 初回のみ |
| grid_info | line_distance_m | OSM送電線データ | Overpass API | 月次 |
| access_physical | nearest_road_width_m | OSM道路データ | Overpass API + タグ解析 | 月次 |

### SEMI（半自動・要レビュー）

| テーブル | フィールド | 取得方法 | レビュー理由 | 更新頻度 |
|---------|-----------|---------|-------------|---------|
| grid_info | capacity_available_mw | 電力会社PDF/CSV | PDF解析精度に限界 | 四半期 |
| grid_info | congestion_level | 空容量データから推定 | 閾値判定の妥当性確認 | 四半期 |
| land_regulatory | city_plan_zone | 国土数値情報GIS | 境界線上の判定確認 | 年次 |
| land_regulatory | land_use_zone | 自治体GIS | 複数用途の優先順位確認 | 年次 |
| land_regulatory | farmland_class | 農地データ | 除外申請状況の確認 | 年次 |
| access_physical | parcel_shape | 地番ポリゴン解析 | 形状分類の妥当性確認 | 初回のみ |
| access_physical | road_access | OSM道路データ | 実際の通行可否確認 | 月次 |
| economics | land_price_jpy_per_m2 | 公示地価API | 相場と実勢価格の乖離確認 | 年次 |

### MANUAL（手動入力）

| テーブル | フィールド | 入力者 | 入力タイミング | 情報源 |
|---------|-----------|--------|--------------|--------|
| grid_info | connection_cost_jpy | 担当者 | 見積取得後 | 電力会社見積 |
| land_regulatory | local_ordinances | 担当者 | 調査完了後 | 自治体条例 |
| land_regulatory | build_restrictions | 担当者 | 調査完了後 | 開発許可基準 |
| access_physical | inside_setback_need | 担当者 | 現地調査後 | 現地確認 |
| access_physical | neighbor_clearance_* | 担当者 | 現地調査後 | 実測 |
| economics | land_rent_jpy_per_tsubo_month | 担当者 | 交渉後 | 地主交渉結果 |
| economics | construction_cost_estimate_jpy | 担当者 | 見積取得後 | 施工業者見積 |
| economics | planned_power_mw | 担当者 | 計画策定時 | 事業計画 |
| economics | planned_energy_mwh | 担当者 | 計画策定時 | 事業計画 |

---

## 🔧 実装詳細

### 1. Google Elevation API

**目的**: 標高と勾配の取得

```typescript
// src/services/automation/elevation.service.ts
import axios from 'axios';

interface ElevationResult {
  elevation_m: number;
  slope_pct: number;
}

export class ElevationService {
  private apiKey: string;
  
  async getElevation(lat: number, lon: number): Promise<ElevationResult> {
    // 対象地点と周辺4点の標高を取得
    const locations = [
      `${lat},${lon}`,
      `${lat + 0.0001},${lon}`,
      `${lat - 0.0001},${lon}`,
      `${lat},${lon + 0.0001}`,
      `${lat},${lon - 0.0001}`
    ].join('|');
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/elevation/json`,
      {
        params: {
          locations,
          key: this.apiKey
        }
      }
    );
    
    const elevations = response.data.results.map(r => r.elevation);
    const centerElevation = elevations[0];
    
    // 勾配計算（最大傾斜）
    const maxSlope = Math.max(
      ...elevations.slice(1).map(e => 
        Math.abs(e - centerElevation) / 11.1 * 100 // 11.1m ≈ 0.0001度
      )
    );
    
    return {
      elevation_m: centerElevation,
      slope_pct: maxSlope
    };
  }
}
```

**automation_sources登録**:
```typescript
await automationSourcesRepo.create({
  site_id,
  table_name: 'geo_risk',
  field_name: 'elevation_m',
  source_type: 'API',
  source_name: 'Google Elevation API',
  source_url: 'https://maps.googleapis.com/maps/api/elevation',
  last_refreshed_at: new Date(),
  refresh_interval_hours: null, // 初回のみ
  parser_version: 'v1.0'
});
```

---

### 2. 国土地理院ハザードタイル

**目的**: 浸水深クラスの取得

```typescript
// src/services/automation/hazard.service.ts
export class HazardService {
  async getFloodDepth(lat: number, lon: number): Promise<string> {
    // タイル座標計算（ズームレベル15）
    const zoom = 15;
    const tileX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const tileY = Math.floor(
      (1 - Math.log(Math.tan(lat * Math.PI / 180) + 
       1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
    );
    
    // ハザードタイル取得
    const tileUrl = `https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/${zoom}/${tileX}/${tileY}.png`;
    
    // PNG解析してピクセル値から浸水深判定
    const depth = await this.analyzeFloodTile(tileUrl, lat, lon, tileX, tileY, zoom);
    
    // 浸水深クラス分類
    if (depth < 0.5) return '0.5m未満';
    if (depth < 2.0) return '2m未満';
    if (depth < 5.0) return '5m未満';
    return '5m超';
  }
}
```

---

### 3. OSM Overpass API

**目的**: 道路幅員の取得

```typescript
// src/services/automation/osm.service.ts
export class OSMService {
  async getNearestRoadWidth(lat: number, lon: number): Promise<number | null> {
    const query = `
      [out:json];
      way(around:100,${lat},${lon})["highway"];
      out tags;
    `;
    
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query
    );
    
    const roads = response.data.elements;
    if (roads.length === 0) return null;
    
    // 最寄りの道路の幅員を取得
    const nearestRoad = roads[0];
    const width = nearestRoad.tags.width || 
                  this.estimateWidthFromType(nearestRoad.tags.highway);
    
    return parseFloat(width);
  }
  
  private estimateWidthFromType(highwayType: string): number {
    const widthMap = {
      'motorway': 12,
      'trunk': 10,
      'primary': 8,
      'secondary': 6,
      'tertiary': 5,
      'residential': 4,
      'service': 3
    };
    return widthMap[highwayType] || 4;
  }
}
```

---

### 4. 電力会社PDF解析（SEMI）

**目的**: 空き容量の抽出

```typescript
// n8nワークフローで実装
// 1. 電力会社サイトから最新PDFをダウンロード
// 2. PDF → テキスト変換
// 3. 正規表現で空き容量を抽出
// 4. データベースに保存（automation_level = 'SEMI'）
// 5. レビュー通知を送信

// 抽出例
const pdfText = await extractTextFromPDF(pdfUrl);
const pattern = /(\d+kV)\s+(\d+\.?\d*)\s*MW/g;
const matches = [...pdfText.matchAll(pattern)];

for (const match of matches) {
  await gridInfoRepo.upsert({
    voltage_kv: parseInt(match[1]),
    capacity_available_mw: parseFloat(match[2]),
    automation_level: 'SEMI', // 要レビュー
    updated_from_source_at: new Date()
  });
}
```

---

## 🔄 自動更新フロー

### 初回インポート時

```
1. sites作成（CSV/TSVインポート）
   ↓
2. 初期ジョブトリガー
   ↓
3. AUTOフィールド取得
   - geo_risk: 標高/勾配/浸水/日照
   - grid_info: 変電所距離
   - access_physical: 道路幅員（暫定）
   ↓
4. SEMIフィールドプレースホルダ作成
   - grid_info: capacity_available_mw = null
   - land_regulatory: city_plan_zone = '未確認'
   ↓
5. automation_sources記録
   ↓
6. scores初期計算（v1.0式）
```

### 定期更新

```
1. automation_sourcesをスキャン
   ↓
2. refresh_interval_hoursを確認
   ↓
3. 更新が必要なフィールドを抽出
   ↓
4. n8nワークフロー実行
   ↓
5. updated_from_source_at更新
   ↓
6. SEMIフィールドは「要レビュー」フラグ
   ↓
7. scores再計算
```

---

## 🎨 GUI表示

### フィールドバッジ

```tsx
// src/components/AutomationBadge.tsx
export const AutomationBadge = ({ level }: { level: 'AUTO' | 'SEMI' | 'MANUAL' }) => {
  const config = {
    AUTO: { icon: '🟢', label: '自動取得', color: 'green' },
    SEMI: { icon: '🟡', label: '要レビュー', color: 'yellow' },
    MANUAL: { icon: '🔵', label: '手動入力', color: 'blue' }
  };
  
  const { icon, label, color } = config[level];
  
  return (
    <span className={`badge badge-${color}`}>
      {icon} {label}
    </span>
  );
};
```

### データ取得元表示

```tsx
// src/components/DataSourceInfo.tsx
export const DataSourceInfo = ({ siteId, tableName, fieldName }: Props) => {
  const source = useAutomationSource(siteId, tableName, fieldName);
  
  if (!source) return null;
  
  return (
    <div className="data-source-info">
      <p>取得元: {source.source_name}</p>
      <p>最終更新: {formatDate(source.last_refreshed_at)}</p>
      {source.source_url && (
        <a href={source.source_url} target="_blank">詳細を見る</a>
      )}
    </div>
  );
};
```

---

## 📝 レビューワークフロー

### SEMIフィールドのレビュー

```typescript
// src/services/review.service.ts
export class ReviewService {
  async approveSemiField(
    siteId: string,
    tableName: string,
    fieldName: string,
    userId: string
  ) {
    // 1. automation_levelをSEMI → MANUALに変更
    await this.updateAutomationLevel(siteId, tableName, fieldName, 'MANUAL');
    
    // 2. audit_logに記録
    await auditLogRepo.create({
      site_id: siteId,
      actor: userId,
      table_name: tableName,
      field_name: fieldName,
      old_value: 'SEMI',
      new_value: 'MANUAL',
      changed_at: new Date()
    });
    
    // 3. 「要レビュー」フラグを解除
    await this.clearReviewFlag(siteId, tableName, fieldName);
    
    // 4. スコア再計算
    await scoreService.recalculate(siteId);
  }
}
```

---

## 🔗 関連ドキュメント

- [データベーススキーマ](../database/SCHEMA_DESIGN_V2.md)
- [スコア計算式](./SCORING_FORMULA.md)
- [n8nワークフロー](./N8N_WORKFLOWS.md)
- [API仕様](./API_SPECIFICATION.md)
