import { createContext } from 'react';
import type { UserResponse, LoginRequest, SignUpRequest } from '../api/types';

export interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: SignUpRequest) => Promise<void>;
  logout: () => void;
  refreshUser: (user: UserResponse) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
