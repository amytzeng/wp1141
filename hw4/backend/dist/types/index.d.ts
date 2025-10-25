import { Request } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
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
//# sourceMappingURL=index.d.ts.map