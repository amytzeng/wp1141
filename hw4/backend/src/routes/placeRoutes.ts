import { Router, Request, Response, NextFunction } from 'express';
import { getPlaces, createPlace, updatePlace, deletePlace } from '../controllers/placeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', getPlaces as any);
router.post('/', createPlace as any);
router.put('/:id', updatePlace as any);
router.delete('/:id', deletePlace as any);

export default router;
