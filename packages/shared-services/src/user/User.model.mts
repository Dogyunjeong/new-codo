export interface User {
  id: string;
  username?: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: 'google' | 'apple';
  providerId: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserData {
  username?: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: 'google' | 'apple';
  providerId: string;
}

export interface UpdateUserData {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  lastLoginAt?: Date;
}

export interface UserFilters {
  email?: string;
  provider?: string;
  providerId?: string;
  isVerified?: boolean;
}