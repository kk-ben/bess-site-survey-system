# 📊 スコア計算式ドキュメント

## 概要

BESS Site Survey Systemのスコア計算式は、YAML形式で外部管理され、版管理されています。

---

## 🎯 スコア構成

### 総合スコア

```
score_total = w1 × score_grid 
            + w2 × score_geo 
            + w3 × score_regulatory 
            + w4 × score_access 
            + w5 × score_economics

grade = A (score_total >= 80)
        B (60 <= score_total < 80)
        C (40 <= score_total < 60)
        D (20 <= score_total < 40)
        F (score_total < 20)
```

---

## 📐 スコア計算式 v1.0

### 1. 系統スコア（score_grid）

**重み**: 30%

```yaml
score_grid:
  max_score: 100
  components:
    - name: capacity_available
      weight: 0.40
      formula:
        - condition: capacity_available_mw >= 5
          points: 40
        - condition: capacity_available_mw >= 2
          points: 30
        - condition: capacity_available_mw >= 1
          points: 20
        - condition: capacity_available_mw < 1
          points: 0
    
    - name: substation_distance
      weight: 0.40
      formula:
        - condition: substation_distance_m <= 500
          points: 40
        - condition: substation_distance_m <= 1000
          points: 30
        - condition: substation_distance_m <= 2000
          points: 20
        - condition: substation_distance_m > 2000
          points: 10
    
    - name: congestion_level
      weight: 0.20
      formula:
        - condition: congestion_level == 'low'
          points: 20
        - condition: congestion_level == 'medium'
          points: 10
        - condition: congestion_level == 'high'
          points: 0
```

**TypeScript実装**:
```typescript
function calculateGridScore(gridInfo: GridInfo): number {
  let score = 0;
  
  // 空き容量（40点）
  if (gridInfo.capacity_available_mw >= 5) score += 40;
  else if (gridInfo.capacity_available_mw >= 2) score += 30;
  else if (gridInfo.capacity_available_mw >= 1) score += 20;
  
  // 変電所距離（40点）
  if (gridInfo.substation_distance_m <= 500) score += 40;
  else if (gridInfo.substation_distance_m <= 1000) score += 30;
  else if (gridInfo.substation_distance_m <= 2000) score += 20;
  else score += 10;
  
  // 混雑度（20点）
  if (gridInfo.congestion_level === 'low') score += 20;
  else if (gridInfo.congestion_level === 'medium') score += 10;
  
  return score;
}
```

---

### 2. 地理リスクスコア（score_geo）

**重み**: 25%

```yaml
score_geo:
  max_score: 100
  components:
    - name: flood_risk
      weight: 0.40
      formula:
        - condition: flood_depth_class == '0.5m未満'
          points: 40
        - condition: flood_depth_class == '2m未満'
          points: 25
        - condition: flood_depth_class == '5m未満'
          points: 10
        - condition: flood_depth_class == '5m超'
          points: 0
    
    - name: slope
      weight: 0.30
      formula:
        - condition: slope_pct <= 3
          points: 30
        - condition: slope_pct <= 5
          points: 20
        - condition: slope_pct <= 10
          points: 10
        - condition: slope_pct > 10
          points: 0
    
    - name: elevation
      weight: 0.20
      formula:
        - condition: elevation_m >= 10 AND elevation_m <= 100
          points: 20
        - condition: elevation_m >= 5 AND elevation_m <= 200
          points: 15
        - condition: elevation_m < 5 OR elevation_m > 200
          points: 5
    
    - name: sun_loss
      weight: 0.10
      formula:
        - condition: sun_hours_loss <= 5
          points: 10
        - condition: sun_hours_loss <= 10
          points: 7
        - condition: sun_hours_loss > 10
          points: 3
```

---

### 3. 法規制スコア（score_regulatory）

**重み**: 20%

```yaml
score_regulatory:
  max_score: 100
  components:
    - name: city_plan
      weight: 0.40
      formula:
        - condition: city_plan_zone == '非線引き'
          points: 40
        - condition: city_plan_zone == '市街化調整区域' AND farmland_class == '農振除外'
          points: 35
        - condition: city_plan_zone == '市街化区域'
          points: 30
        - condition: city_plan_zone == '市街化調整区域' AND farmland_class == '白地'
          points: 20
        - condition: farmland_class == '保全'
          points: 0
    
    - name: land_use
      weight: 0.30
      formula:
        - condition: land_use_zone == '工業地域' OR land_use_zone == '工業専用地域'
          points: 30
        - condition: land_use_zone == '準工業地域'
          points: 25
        - condition: land_use_zone == '無指定'
          points: 20
        - condition: land_use_zone LIKE '%住居%'
          points: 10
    
    - name: restrictions
      weight: 0.30
      formula:
        - condition: cultural_env_zone IS NULL AND park_landscape_zone IS NULL
          points: 30
        - condition: cultural_env_zone IS NOT NULL OR park_landscape_zone IS NOT NULL
          points: 15
        - condition: local_ordinances LIKE '%禁止%'
          points: 0
```

---

### 4. アクセススコア（score_access）

**重み**: 15%

```yaml
score_access:
  max_score: 100
  components:
    - name: road_width
      weight: 0.50
      formula:
        - condition: nearest_road_width_m >= 6
          points: 50
        - condition: nearest_road_width_m >= 4
          points: 40
        - condition: nearest_road_width_m >= 3
          points: 25
        - condition: nearest_road_width_m < 3
          points: 10
    
    - name: parcel_shape
      weight: 0.30
      formula:
        - condition: parcel_shape == '長方形'
          points: 30
        - condition: parcel_shape == '正方形'
          points: 25
        - condition: parcel_shape == '台形'
          points: 15
        - condition: parcel_shape == '不整形'
          points: 5
    
    - name: clearance
      weight: 0.20
      formula:
        - condition: MIN(neighbor_clearance_*) >= 10
          points: 20
        - condition: MIN(neighbor_clearance_*) >= 5
          points: 15
        - condition: MIN(neighbor_clearance_*) >= 2
          points: 10
        - condition: MIN(neighbor_clearance_*) < 2
          points: 0
```

---

### 5. 経済性スコア（score_economics）

**重み**: 10%

```yaml
score_economics:
  max_score: 100
  components:
    - name: land_cost
      weight: 0.40
      formula:
        - condition: land_price_jpy_per_m2 <= 5000
          points: 40
        - condition: land_price_jpy_per_m2 <= 10000
          points: 30
        - condition: land_price_jpy_per_m2 <= 20000
          points: 20
        - condition: land_price_jpy_per_m2 > 20000
          points: 10
    
    - name: connection_cost
      weight: 0.30
      formula:
        - condition: connection_cost_jpy <= 50000000
          points: 30
        - condition: connection_cost_jpy <= 100000000
          points: 20
        - condition: connection_cost_jpy <= 200000000
          points: 10
        - condition: connection_cost_jpy > 200000000
          points: 0
    
    - name: construction_cost
      weight: 0.30
      formula:
        - condition: construction_cost_estimate_jpy <= 100000000
          points: 30
        - condition: construction_cost_estimate_jpy <= 200000000
          points: 20
        - condition: construction_cost_estimate_jpy <= 300000000
          points: 10
        - condition: construction_cost_estimate_jpy > 300000000
          points: 0
```

---

## 🔄 版管理

### スコア式ファイル

```yaml
# config/scoring/formula-v1.0.yaml
version: "1.0"
created_at: "2025-01-01"
description: "初期スコア計算式"

weights:
  grid: 0.30
  geo: 0.25
  regulatory: 0.20
  access: 0.15
  economics: 0.10

grid_formula:
  # ... 上記の定義

geo_formula:
  # ... 上記の定義

# ... 他のスコア式
```

### 版の切り替え

```typescript
// src/services/scoring.service.ts
export class ScoringService {
  async calculateScore(siteId: string, formulaVersion: string = 'v1.0') {
    // スコア式を読み込み
    const formula = await this.loadFormula(formulaVersion);
    
    // データ取得
    const site = await sitesRepo.findById(siteId);
    const gridInfo = await gridInfoRepo.findBySiteId(siteId);
    const geoRisk = await geoRiskRepo.findBySiteId(siteId);
    // ...
    
    // スコア計算
    const scoreGrid = this.calculateGridScore(gridInfo, formula.grid_formula);
    const scoreGeo = this.calculateGeoScore(geoRisk, formula.geo_formula);
    // ...
    
    const scoreTotal = 
      formula.weights.grid * scoreGrid +
      formula.weights.geo * scoreGeo +
      formula.weights.regulatory * scoreRegulatory +
      formula.weights.access * scoreAccess +
      formula.weights.economics * scoreEconomics;
    
    const grade = this.calculateGrade(scoreTotal);
    
    // 保存
    await scoresRepo.create({
      site_id: siteId,
      score_total: scoreTotal,
      score_grid: scoreGrid,
      score_geo: scoreGeo,
      score_regulatory: scoreRegulatory,
      score_access: scoreAccess,
      score_economics: scoreEconomics,
      grade,
      formula_version: formulaVersion,
      calculated_at: new Date()
    });
    
    return { scoreTotal, grade };
  }
}
```

---

## 📈 スコア履歴

### 履歴管理

```sql
-- スコア履歴を確認
SELECT 
  calculated_at,
  formula_version,
  score_total,
  grade
FROM scores
WHERE site_id = 'xxx'
ORDER BY calculated_at DESC;
```

### 再計算

```typescript
// GUIから再計算
async function recalculateAllScores(formulaVersion: string) {
  const sites = await sitesRepo.findAll();
  
  for (const site of sites) {
    await scoringService.calculateScore(site.id, formulaVersion);
  }
}
```

---

## 🎨 GUI表示

### スコア表示

```tsx
// src/components/ScoreCard.tsx
export const ScoreCard = ({ score }: { score: Score }) => {
  return (
    <div className="score-card">
      <div className="grade-badge grade-{score.grade}">
        {score.grade}
      </div>
      <div className="score-total">{score.score_total.toFixed(1)}</div>
      
      <div className="score-breakdown">
        <ScoreBar label="系統" score={score.score_grid} max={100} />
        <ScoreBar label="地理" score={score.score_geo} max={100} />
        <ScoreBar label="法規制" score={score.score_regulatory} max={100} />
        <ScoreBar label="アクセス" score={score.score_access} max={100} />
        <ScoreBar label="経済性" score={score.score_economics} max={100} />
      </div>
      
      <div className="formula-version">
        計算式: {score.formula_version}
      </div>
    </div>
  );
};
```

---

## 🔗 関連ドキュメント

- [データベーススキーマ](../database/SCHEMA_DESIGN_V2.md)
- [自動化ロジック](./AUTOMATION_LOGIC.md)
- [API仕様](./API_SPECIFICATION.md)
