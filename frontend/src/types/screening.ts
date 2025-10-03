export type Recommendation = 'excellent' | 'good' | 'fair' | 'poor' | 'unsuitable';

export interface ScreeningCriteria {
  minGridScore?: number;
  minSetbackScore?: number;
  minRoadScore?: number;
  minPoleScore?: number;
  minTotalScore?: number;
  minWeightedScore?: number;
  recommendations?: Recommendation[];
  excludeViolations?: boolean;
}

export interface ScreeningResult {
  siteId: string;
  siteName: string;
  latitude: number;
  longitude: number;
  totalScore: number;
  weightedScore: number;
  recommendation: Recommendation;
  evaluationDate: string;
  gridScore: number;
  setbackScore: number;
  roadScore: number;
  poleScore: number;
  violatesSetback: boolean;
}

export interface ScreeningStats {
  totalSites: number;
  matchingSites: number;
  averageScore: number;
  recommendationBreakdown: Record<string, number>;
}

export interface ScreeningResponse {
  success: boolean;
  data: {
    results: ScreeningResult[];
    stats: ScreeningStats;
  };
}

export type ExportFormat = 'csv' | 'geojson' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  criteria: ScreeningCriteria;
}
