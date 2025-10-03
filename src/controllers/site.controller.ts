import { Response, NextFunction } from 'express';
import { SiteService } from '@/services/site.service';
import { ValidationError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export class SiteController {
  static async getAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await SiteService.getAll(page, limit, { status, search });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { siteId } = req.params;
      const site = await SiteService.getById(siteId);

      res.json({
        success: true,
        data: { site },
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { siteName, address, latitude, longitude, areaSqm, landUse, ownerInfo, notes } =
        req.body;

      if (!siteName || !latitude || !longitude) {
        throw new ValidationError('Site name, latitude, and longitude are required');
      }

      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const site = await SiteService.create({
        siteName,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        areaSqm: areaSqm ? parseFloat(areaSqm) : undefined,
        landUse,
        ownerInfo,
        notes,
        createdBy: req.user.userId,
      });

      res.status(201).json({
        success: true,
        data: { site },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { siteId } = req.params;
      const updateData = req.body;

      if (updateData.latitude) {
        updateData.latitude = parseFloat(updateData.latitude);
      }
      if (updateData.longitude) {
        updateData.longitude = parseFloat(updateData.longitude);
      }
      if (updateData.areaSqm) {
        updateData.areaSqm = parseFloat(updateData.areaSqm);
      }

      const site = await SiteService.update(siteId, updateData);

      res.json({
        success: true,
        data: { site },
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { siteId } = req.params;

      await SiteService.delete(siteId);

      res.json({
        success: true,
        message: 'Site deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
