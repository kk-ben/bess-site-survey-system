import { apiClient } from '@/lib/api';
import { User } from '@/types/auth';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: 'admin' | 'manager' | 'viewer';
  password?: string;
}

export class UserService {
  static async getUsers(params?: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: { users: User[]; total: number } }> {
    return apiClient.get('/users', params);
  }

  static async getUserById(userId: string): Promise<{ success: boolean; data: { user: User } }> {
    return apiClient.get(`/users/${userId}`);
  }

  static async createUser(data: CreateUserData): Promise<{ success: boolean; data: { user: User } }> {
    return apiClient.post('/users', data);
  }

  static async updateUser(
    userId: string,
    data: UpdateUserData
  ): Promise<{ success: boolean; data: { user: User } }> {
    return apiClient.put(`/users/${userId}`, data);
  }

  static async deleteUser(userId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/users/${userId}`);
  }
}
