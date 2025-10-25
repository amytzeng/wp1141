export interface Place {
  id: string;
  title: string;
  description?: string;
  category?: string;
  lat: number;
  lng: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
