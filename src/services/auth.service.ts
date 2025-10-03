import { pool } from '@/config/database';
import { AuthUtils } from '@/utils/auth';
import { AuthError, ValidationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    const result = await pool.query(
      'SELECT user_id, email, password_hash, full_name, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AuthError('Invalid email or password');
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new AuthError('Account is inactive');
    }

    const isValidPassword = await AuthUtils.comparePassword(
      password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new AuthError('Invalid email or password');
    }

    const tokenPayload = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = AuthUtils.generateAccessToken(tokenPayload);
    const refreshToken = AuthUtils.generateRefreshToken(tokenPayload);

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Store refresh token
    await pool.query(
      `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.user_id, refreshToken]
    );

    logger.info('User logged in', { userId: user.user_id, email: user.email });

    return {
      accessToken,
      refreshToken,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    };
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = AuthUtils.verifyRefreshToken(refreshToken);

      const sessionResult = await pool.query(
        `SELECT s.*, u.email, u.full_name, u.role, u.is_active
         FROM user_sessions s
         JOIN users u ON s.user_id = u.user_id
         WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
        [refreshToken]
      );

      if (sessionResult.rows.length === 0) {
        throw new AuthError('Invalid or expired refresh token');
      }

      const session = sessionResult.rows[0];

      if (!session.is_active) {
        throw new AuthError('Account is inactive');
      }

      const tokenPayload = {
        userId: session.user_id,
        email: session.email,
        role: session.role,
      };

      const newAccessToken = AuthUtils.generateAccessToken(tokenPayload);
      const newRefreshToken = AuthUtils.generateRefreshToken(tokenPayload);

      // Delete old session and create new one
      await pool.query('DELETE FROM user_sessions WHERE session_id = $1', [
        session.session_id,
      ]);

      await pool.query(
        `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [session.user_id, newRefreshToken]
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          userId: session.user_id,
          email: session.email,
          fullName: session.full_name,
          role: session.role,
        },
      };
    } catch (error) {
      throw new AuthError('Invalid or expired refresh token');
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    await pool.query('DELETE FROM user_sessions WHERE refresh_token = $1', [
      refreshToken,
    ]);
  }

  static async requestPasswordReset(email: string): Promise<string> {
    const result = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return 'If the email exists, a reset link will be sent';
    }

    const userId = result.rows[0].user_id;
    const resetToken = AuthUtils.generateResetToken();

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [userId, resetToken]
    );

    logger.info('Password reset requested', { userId, email });

    // TODO: Send email with reset link
    return resetToken;
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const result = await pool.query(
      `SELECT user_id FROM password_reset_tokens
       WHERE token = $1 AND expires_at > NOW() AND used = false`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const userId = result.rows[0].user_id;
    const passwordHash = await AuthUtils.hashPassword(newPassword);

    await pool.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [
      passwordHash,
      userId,
    ]);

    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE token = $1',
      [token]
    );

    // Invalidate all sessions
    await pool.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);

    logger.info('Password reset completed', { userId });
  }
}
