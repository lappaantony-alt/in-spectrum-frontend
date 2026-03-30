import axios from 'axios';
import toast from 'react-hot-toast';
import { toCamelCaseKeys, toSnakeCaseKeys } from '../lib/case';

const TOKEN_KEY = 'inspectrum_token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data && typeof config.data === 'object') {
    config.data = toSnakeCaseKeys(config.data);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      response.data = toCamelCaseKeys(response.data);
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as { message?: string } | undefined;
      const message = data?.message || error.message;

      const requestUrl = error.config?.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/sign-up');

      if (status === 401 && !isAuthEndpoint) {
        localStorage.removeItem(TOKEN_KEY);
        toast.error('Сесія закінчилася. Будь ласка, увійдіть знову.');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 409) {
        toast.error(message || 'Конфлікт — ресурс вже існує.');
      } else if (status && status >= 500) {
        toast.error('Помилка сервера. Спробуйте пізніше.');
      } else if (!error.response) {
        toast.error('Помилка мережі — перевірте зʼєднання.');
      }
    }

    return Promise.reject(error);
  },
);

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
