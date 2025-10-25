"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseGeocode = exports.geocode = void 0;
const axios_1 = __importDefault(require("axios"));
const geocode = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address || typeof address !== 'string') {
            return res.status(400).json({ error: 'Address is required' });
        }
        const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address,
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Geocode error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.geocode = geocode;
const reverseGeocode = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng || typeof lat !== 'string' || typeof lng !== 'string') {
            return res.status(400).json({ error: 'Lat and lng are required' });
        }
        const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${lat},${lng}`,
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Reverse geocode error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.reverseGeocode = reverseGeocode;
//# sourceMappingURL=mapsController.js.map