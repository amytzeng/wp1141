export interface AuthRequest extends Express.Request {
  userId?: string;
  body: any;
  params: any;
  query: any;
  headers: any;
}

export interface PlaceData {
  title: string;
  description?: string;
  category?: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface UserData {
  email: string;
  password: string;
  name?: string;
}
