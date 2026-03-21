import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-api-key-change-me';
const AUTH_FREE_PATHS = ['/auth/login', '/auth/register'];
const TOKEN_AUTH_MESSAGES = new Set([
  'No token provided',
  'Invalid token',
  'User not found',
  'Authentication failed',
]);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const token = localStorage.getItem('token');
    const message = error.response?.data?.message;
    const isAuthFreePath = AUTH_FREE_PATHS.some((path) => requestUrl.includes(path));
    const isTokenErrorMessage =
      typeof message === 'string' && TOKEN_AUTH_MESSAGES.has(message);

    if (status === 401 && token && !isAuthFreePath && isTokenErrorMessage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);
