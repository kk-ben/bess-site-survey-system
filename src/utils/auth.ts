import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(payload: {
    userId: string;
    email: string;
    role: string;
  }): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(payload, secret, {
      expiresIn: '1h',
    });
  }

  static generateRefreshToken(payload: {
    userId: string;
    email: string;
    role: string;
  }): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    return jwt.sign(payload, secret, {
      expiresIn: '7d',
    });
  }

  static verifyAccessToken(token: string): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.verify(token, secret);
  }

  static verifyRefreshToken(token: string): any {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    return jwt.verify(token, secret);
  }

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
