import { apiClient } from '@/lib/api';
import { LoginCredentials, LoginResponse, User } from '@/types/auth';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  static async getCurrentUser(): Promise<{ success: boolean; data: { user: User } }> {
    return apiClient.get('/auth/me');
  }

  static async refreshToken(): Promise<{ success: boolean; data: { token: string } }> {
    return apiClient.post('/auth/refresh');
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    return apiClient.post('/auth/password-reset/request', { email });
  }

  static async resetPassword(token: string, password: string): Promise<{ success: boolean }> {
    return apiClient.post('/auth/password-reset/confirm', { token, password });
  }
}
