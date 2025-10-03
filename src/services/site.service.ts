import { pool } from '@/config/database';
import { ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export interface CreateSiteDto {
  siteName: string;
  address?: string;
  latitude: number;
  longitude: number;
  areaSqm?: number;
  landUse?: string;
  ownerInfo?: string;
  notes?: string;
  createdBy: string;
}

export interface UpdateSiteDto {
  siteName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  areaSqm?: number;
  landUse?: string;
  ownerInfo?: string;
  notes?: string;
  status?: 'pending' | 'evaluated' | 'approved' | 'rejected';
}

export class SiteService {
  static async getAll(
    page = 1,
    limit = 20,
    filters?: {
      status?: string;
      search?: string;
    }
  ) {
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters?.search) {
      conditions.push(
        `(site_name ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`
      );
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM sites ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    values.push(limit, offset);

    const result = await pool.query(
      `SELECT 
        site_id,
        site_name,
        address,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        area_sqm,
        land_use,
        status,
        created_at,
        updated_at
       FROM sites
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );

    return {
      sites: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(siteId: string) {
    const result = await pool.query(
      `SELECT 
        site_id,
        site_name,
        address,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        area_sqm,
        land_use,
        owner_info,
        notes,
        status,
        created_by,
        created_at,
        updated_at
       FROM sites
       WHERE site_id = $1`,
      [siteId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Site not found');
    }

    return result.rows[0];
  }

  static async create(data: CreateSiteDto) {
    if (!data.siteName || !data.latitude || !data.longitude) {
      throw new ValidationError('Site name, latitude, and longitude are required');
    }

    const result = await pool.query(
      `INSERT INTO sites (
        site_name,
        address,
        location,
        area_sqm,
        land_use,
        owner_info,
        notes,
        created_by
      )
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7, $8, $9)
      RETURNING 
        site_id,
        site_name,
        address,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        area_sqm,
        land_use,
        status,
        created_at`,
      [
        data.siteName,
        data.address,
        data.longitude,
        data.latitude,
        data.areaSqm,
        data.landUse,
        data.ownerInfo,
        data.notes,
        data.createdBy,
      ]
    );

    logger.info('Site created', { siteId: result.rows[0].site_id });

    return result.rows[0];
  }

  static async update(siteId: string, data: UpdateSiteDto) {
    await this.getById(siteId);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.siteName) {
      updates.push(`site_name = $${paramIndex++}`);
      values.push(data.siteName);
    }

    if (data.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(data.address);
    }

    if (data.latitude && data.longitude) {
      updates.push(
        `location = ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326)::geography`
      );
      values.push(data.longitude, data.latitude);
    }

    if (data.areaSqm !== undefined) {
      updates.push(`area_sqm = $${paramIndex++}`);
      values.push(data.areaSqm);
    }

    if (data.landUse !== undefined) {
      updates.push(`land_use = $${paramIndex++}`);
      values.push(data.landUse);
    }

    if (data.ownerInfo !== undefined) {
      updates.push(`owner_info = $${paramIndex++}`);
      values.push(data.ownerInfo);
    }

    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(data.notes);
    }

    if (data.status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      return await this.getById(siteId);
    }

    values.push(siteId);

    const result = await pool.query(
      `UPDATE sites
       SET ${updates.join(', ')}
       WHERE site_id = $${paramIndex}
       RETURNING 
        site_id,
        site_name,
        address,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        area_sqm,
        land_use,
        status,
        updated_at`,
      values
    );

    logger.info('Site updated', { siteId });

    return result.rows[0];
  }

  static async delete(siteId: string) {
    const result = await pool.query(
      'DELETE FROM sites WHERE site_id = $1 RETURNING site_id',
      [siteId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Site not found');
    }

    logger.info('Site deleted', { siteId });
  }

  static async bulkCreate(sites: CreateSiteDto[]) {
    const client = await pool.connect();
    const created: any[] = [];
    const errors: any[] = [];

    try {
      await client.query('BEGIN');

      for (let i = 0; i < sites.length; i++) {
        try {
          const site = sites[i];
          const result = await client.query(
            `INSERT INTO sites (
              site_name,
              address,
              location,
              area_sqm,
              land_use,
              owner_info,
              notes,
              created_by
            )
            VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7, $8, $9)
            RETURNING site_id, site_name`,
            [
              site.siteName,
              site.address,
              site.longitude,
              site.latitude,
              site.areaSqm,
              site.landUse,
              site.ownerInfo,
              site.notes,
              site.createdBy,
            ]
          );

          created.push(result.rows[0]);
        } catch (error: any) {
          errors.push({
            row: i + 1,
            data: sites[i],
            error: error.message,
          });
        }
      }

      await client.query('COMMIT');

      logger.info('Bulk site creation completed', {
        created: created.length,
        errors: errors.length,
      });

      return { created, errors };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
