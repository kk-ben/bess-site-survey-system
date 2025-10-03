export interface EvaluationContext {
  siteId: string;
  latitude: number;
  longitude: number;
  configParams: ConfigParameters;
}

export interface ConfigParameters {
  gridWeight: number;
  setbackWeight: number;
  roadWeight: number;
  poleWeight: number;
  gridMaxDistanceM: number;
  gridMinCapacityKw: number;
  residentialSetbackM: number;
  schoolSetbackM: number;
  hospitalSetbackM: number;
  roadMaxDistanceM: number;
  roadMinWidthM: number;
  poleMaxDistanceM: number;
}

export interface EvaluationResult {
  score: number;
  details: any;
  passed: boolean;
  reason?: string;
}

export interface IEvaluator {
  evaluate(context: EvaluationContext): Promise<EvaluationResult>;
  getName(): string;
  getWeight(config: ConfigParameters): number;
}

export interface FinalEvaluation {
  siteId: string;
  gridScore: number;
  setbackScore: number;
  roadScore: number;
  poleScore: number;
  totalScore: number;
  weightedScore: number;
  recommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'unsuitable';
  recommendationReason: string;
  details: {
    grid: any;
    setback: any;
    road: any;
    pole: any;
  };
}
