import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { SiteService, CreateSiteDto } from './site.service';
import { ValidationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export interface CsvRow {
  [key: string]: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  totalRows: number;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}

export class CsvImportService {
  private static readonly REQUIRED_FIELDS = ['site_name', 'latitude', 'longitude'];
  private static readonly OPTIONAL_FIELDS = [
    'address',
    'area_sqm',
    'land_use',
    'owner_info',
    'notes',
  ];

  static async validateCsv(fileBuffer: Buffer): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];
    const rows: CsvRow[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(fileBuffer);

      stream
        .pipe(csvParser())
        .on('data', (row: CsvRow) => {
          rows.push(row);
        })
        .on('end', () => {
          // Validate headers
          if (rows.length === 0) {
            errors.push({
              row: 0,
              field: 'file',
              message: 'CSV file is empty',
            });
          } else {
            const headers = Object.keys(rows[0]);
            const missingFields = this.REQUIRED_FIELDS.filter(
              field => !headers.includes(field)
            );

            if (missingFields.length > 0) {
              errors.push({
                row: 0,
                field: 'headers',
                message: `Missing required fields: ${missingFields.join(', ')}`,
              });
            }
          }

          // Validate each row
          rows.forEach((row, index) => {
            const rowNumber = index + 2; // +2 because index starts at 0 and row 1 is headers

            // Check required fields
            this.REQUIRED_FIELDS.forEach(field => {
              if (!row[field] || row[field].trim() === '') {
                errors.push({
                  row: rowNumber,
                  field,
                  message: `${field} is required`,
                });
              }
            });

            // Validate latitude
            if (row.latitude) {
              const lat = parseFloat(row.latitude);
              if (isNaN(lat) || lat < -90 || lat > 90) {
                errors.push({
                  row: rowNumber,
                  field: 'latitude',
                  message: 'Invalid latitude (must be between -90 and 90)',
                });
              }
            }

            // Validate longitude
            if (row.longitude) {
              const lng = parseFloat(row.longitude);
              if (isNaN(lng) || lng < -180 || lng > 180) {
                errors.push({
                  row: rowNumber,
                  field: 'longitude',
                  message: 'Invalid longitude (must be between -180 and 180)',
                });
              }
            }

            // Validate area_sqm
            if (row.area_sqm && row.area_sqm.trim() !== '') {
              const area = parseFloat(row.area_sqm);
              if (isNaN(area) || area <= 0) {
                warnings.push({
                  row: rowNumber,
                  field: 'area_sqm',
                  message: 'Invalid area (must be a positive number)',
                });
              }
            }
          });

          resolve({
            valid: errors.length === 0,
            errors,
            warnings,
            totalRows: rows.length,
          });
        })
        .on('error', reject);
    });
  }

  static async importCsv(
    fileBuffer: Buffer,
    userId: string
  ): Promise<ImportResult> {
    const rows: CsvRow[] = [];

    // Parse CSV
    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(fileBuffer);

      stream
        .pipe(csvParser())
        .on('data', (row: CsvRow) => {
          rows.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Convert rows to CreateSiteDto
    const sites: CreateSiteDto[] = rows.map(row => ({
      siteName: row.site_name,
      address: row.address || undefined,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      areaSqm: row.area_sqm ? parseFloat(row.area_sqm) : undefined,
      landUse: row.land_use || undefined,
      ownerInfo: row.owner_info || undefined,
      notes: row.notes || undefined,
      createdBy: userId,
    }));

    // Bulk create
    const result = await SiteService.bulkCreate(sites);

    logger.info('CSV import completed', {
      userId,
      totalRows: rows.length,
      success: result.created.length,
      failed: result.errors.length,
    });

    return {
      success: result.created.length,
      failed: result.errors.length,
      errors: result.errors,
    };
  }

  static generateTemplate(): string {
    const headers = [...this.REQUIRED_FIELDS, ...this.OPTIONAL_FIELDS];
    const exampleRow = [
      'Example Site 1',
      '35.6812',
      '139.7671',
      '1000 Main St, Tokyo',
      '5000',
      'Industrial',
      'ABC Corporation',
      'Near highway access',
    ];

    return `${headers.join(',')}\n${exampleRow.join(',')}\n`;
  }
}
