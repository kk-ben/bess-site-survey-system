import { pool } from '@/config/database';
import { AuthUtils } from '@/utils/auth';
import { ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'manager' | 'viewer';
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  role?: 'admin' | 'manager' | 'viewer';
  isActive?: boolean;
}

export class UserService {
  static async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT user_id, email, full_name, role, is_active, created_at, last_login_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(userId: string) {
    const result = await pool.query(
      `SELECT user_id, email, full_name, role, is_active, created_at, updated_at, last_login_at
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    return result.rows[0];
  }

  static async create(data: CreateUserDto) {
    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [data.email]
    );

    if (existingUser.rows.length > 0) {
      throw new ValidationError('Email already exists');
    }

    const passwordHash = await AuthUtils.hashPassword(data.password);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, email, full_name, role, is_active, created_at`,
      [data.email, passwordHash, data.fullName, data.role]
    );

    logger.info('User created', { userId: result.rows[0].user_id });

    return result.rows[0];
  }

  static async update(userId: string, data: UpdateUserDto) {
    const user = await this.getById(userId);

    if (data.email && data.email !== user.email) {
      const existingUser = await pool.query(
        'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
        [data.email, userId]
      );

      if (existingUser.rows.length > 0) {
        throw new ValidationError('Email already exists');
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }

    if (data.fullName) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(data.fullName);
    }

    if (data.role) {
      updates.push(`role = $${paramIndex++}`);
      values.push(data.role);
    }

    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive);
    }

    if (updates.length === 0) {
      return user;
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING user_id, email, full_name, role, is_active, updated_at`,
      values
    );

    logger.info('User updated', { userId });

    return result.rows[0];
  }

  static async delete(userId: string) {
    const result = await pool.query(
      'DELETE FROM users WHERE user_id = $1 RETURNING user_id',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    logger.info('User deleted', { userId });
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const isValid = await AuthUtils.comparePassword(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!isValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const newPasswordHash = await AuthUtils.hashPassword(newPassword);

    await pool.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [
      newPasswordHash,
      userId,
    ]);

    // Invalidate all sessions
    await pool.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);

    logger.info('Password changed', { userId });
  }
}
