import { Response, NextFunction } from 'express';
import { EvaluationService } from '@/services/evaluation.service';
import { ValidationError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export class EvaluationController {
  static async evaluateSite(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { siteId } = req.body;

      if (!siteId) {
        throw new ValidationError('Site ID is required');
      }

      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const result = await EvaluationService.evaluateSite(siteId, req.user.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEvaluationHistory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { siteId } = req.params;

      const history = await EvaluationService.getEvaluationHistory(siteId);

      res.json({
        success: true,
        data: { history },
      });
    } catch (error) {
      next(error);
    }
  }
}
