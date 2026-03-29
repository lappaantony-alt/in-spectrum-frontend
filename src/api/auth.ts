import { apiClient } from './client';
import type { LoginRequest, SignUpRequest, TokenResponse, UserResponse } from './types';

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/login', data);
  return response.data;
}

export async function signUp(data: SignUpRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/sign-up', data);
  return response.data;
}

export async function getMe(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>('/users/me');
  return response.data;
}
