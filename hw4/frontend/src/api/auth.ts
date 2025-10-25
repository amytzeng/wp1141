import api from './client';
import type { AuthResponse } from '../types';

export const login = async (email: string, password: string) => {
  const response = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const register = async (email: string, password: string, name?: string) => {
  const response = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
    name,
  });
  return response.data;
};
