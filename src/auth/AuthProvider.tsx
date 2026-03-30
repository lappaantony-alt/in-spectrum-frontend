import { useState, useEffect, useCallback, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';
import * as authApi from '../api/auth';
import { getStoredToken, setStoredToken, clearStoredToken } from '../api/client';
import { queryClient } from '../lib/queryClient';
import type { UserResponse, LoginRequest, SignUpRequest } from '../api/types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        setUser(userData);
        setToken(storedToken);
      } catch {
        clearStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    queryClient.removeQueries();

    const response = await authApi.login(data);
    setStoredToken(response.token);
    setToken(response.token);

    const userData = await authApi.getMe();
    setUser(userData);
    toast.success('З поверненням!');
  }, []);

  const register = useCallback(async (data: SignUpRequest) => {
    queryClient.removeQueries();

    const response = await authApi.signUp(data);
    setStoredToken(response.token);
    setToken(response.token);

    const userData = await authApi.getMe();
    setUser(userData);
    toast.success('Акаунт успішно створено!');
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    queryClient.clear();
    toast.success('Ви вийшли.');
  }, []);

  const refreshUser = useCallback((updatedUser: UserResponse) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
