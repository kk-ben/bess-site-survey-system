// ============================================================================
// BESS Site Survey System v2.0 - Site Service Unit Tests
// ============================================================================
import { SiteServiceV2 } from '../../services/v2/site.service';

jest.mock('../../models/v2/site.model');
jest.mock('../../utils/logger');
jest.mock('../../config/database');

describe('SiteServiceV2', () => {
  let siteService: SiteServiceV2;

  beforeEach(() => {
    siteService = new SiteServiceV2();
    jest.clearAllMocks();
  });

  describe('Basic Tests', () => {
    it('should create service instance', () => {
      expect(siteService).toBeDefined();
      expect(siteService).toBeInstanceOf(SiteServiceV2);
    });

    it('should have getSites method', () => {
      expect(typeof siteService.getSites).toBe('function');
    });

    it('should have getSiteById method', () => {
      expect(typeof siteService.getSiteById).toBe('function');
    });

    it('should have createSite method', () => {
      expect(typeof siteService.createSite).toBe('function');
    });
  });
});
