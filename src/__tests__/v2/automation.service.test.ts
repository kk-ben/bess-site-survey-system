// ============================================================================
// BESS Site Survey System v2.0 - Automation Service Unit Tests
// ============================================================================
import { GoogleElevationService } from '../../services/automation/google-elevation.service';
import { ScoringService } from '../../services/automation/scoring.service';

jest.mock('axios');
jest.mock('../../models/v2/site.model');
jest.mock('../../utils/logger');
jest.mock('../../config/database');

describe('GoogleElevationService', () => {
  let elevationService: GoogleElevationService;

  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
    elevationService = new GoogleElevationService();
    jest.clearAllMocks();
  });

  describe('Basic Tests', () => {
    it('should create service instance', () => {
      expect(elevationService).toBeDefined();
      expect(elevationService).toBeInstanceOf(GoogleElevationService);
    });

    it('should have isConfigured method', () => {
      expect(typeof elevationService.isConfigured).toBe('function');
    });

    it('should return true when API key is configured', () => {
      expect(elevationService.isConfigured()).toBe(true);
    });
  });
});

describe('ScoringService', () => {
  let scoringService: ScoringService;

  beforeEach(() => {
    scoringService = new ScoringService();
    jest.clearAllMocks();
  });

  describe('Basic Tests', () => {
    it('should create service instance', () => {
      expect(scoringService).toBeDefined();
      expect(scoringService).toBeInstanceOf(ScoringService);
    });
  });
});
