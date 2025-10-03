import { Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';
import { ValidationError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export class UserController {
  static async getAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await UserService.getAll(page, limit);

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
      const { userId } = req.params;
      const user = await UserService.getById(userId);

      res.json({
        success: true,
        data: { user },
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
      const { email, password, fullName, role } = req.body;

      if (!email || !password || !fullName || !role) {
        throw new ValidationError('All fields are required');
      }

      const user = await UserService.create({
        email,
        password,
        fullName,
        role,
      });

      res.status(201).json({
        success: true,
        data: { user },
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
      const { userId } = req.params;
      const updateData = req.body;

      const user = await UserService.update(userId, updateData);

      res.json({
        success: true,
        data: { user },
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
      const { userId } = req.params;

      await UserService.delete(userId);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new ValidationError('Current and new password are required');
      }

      if (newPassword.length < 8) {
        throw new ValidationError('Password must be at least 8 characters');
      }

      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      await UserService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
