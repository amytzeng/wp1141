import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getPlaces: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createPlace: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePlace: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePlace: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=placeController.d.ts.map