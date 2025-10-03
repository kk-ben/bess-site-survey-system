export interface Site {
  siteId: string;
  siteName: string;
  address: string;
  latitude: number;
  longitude: number;
  areaSqm: number;
  landUse: string;
  status: 'pending' | 'evaluated' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  evaluation?: SiteEvaluation;
}

export interface SiteEvaluation {
  evaluationId: string;
  siteId: string;
  totalScore: number;
  weightedScore: number;
  recommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'unsuitable';
  gridScore: number;
  setbackScore: number;
  roadScore: number;
  poleScore: number;
  violatesSetback: boolean;
  evaluationDate: string;
  recommendationReason: string;
}

export interface CreateSiteData {
  siteName: string;
  address: string;
  latitude: number;
  longitude: number;
  areaSqm: number;
  landUse: string;
}

export interface UpdateSiteData extends Partial<CreateSiteData> {
  status?: Site['status'];
}
