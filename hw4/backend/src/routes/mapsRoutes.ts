import { Router } from 'express';
import { geocode, reverseGeocode } from '../controllers/mapsController';

const router = Router();

router.get('/geocode', geocode);
router.get('/reverse-geocode', reverseGeocode);

export default router;
