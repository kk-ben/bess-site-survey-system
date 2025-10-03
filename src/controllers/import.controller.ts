import { Response, NextFunction } from 'express';
import { CsvImportService } from '@/services/csv-import.service';
import { ValidationError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

export const uploadMiddleware = upload.single('file');

export class ImportController {
  static async validateCsv(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new ValidationError('No file uploaded');
      }

      const result = await CsvImportService.validateCsv(req.file.buffer);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async importCsv(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new ValidationError('No file uploaded');
      }

      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      // Validate first
      const validation = await CsvImportService.validateCsv(req.file.buffer);

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'CSV validation failed',
            details: validation,
          },
        });
        return;
      }

      // Import
      const result = await CsvImportService.importCsv(
        req.file.buffer,
        req.user.userId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTemplate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const template = CsvImportService.generateTemplate();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="site_import_template.csv"'
      );
      res.send(template);
    } catch (error) {
      next(error);
    }
  }
}
