export interface User {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'manager' | 'viewer';
}
