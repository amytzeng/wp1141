import { Request, Response } from 'express';
import axios from 'axios';

export const geocode = async (req: Request, res: Response) => {
  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Address is required' });
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reverseGeocode = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng || typeof lat !== 'string' || typeof lng !== 'string') {
      return res.status(400).json({ error: 'Lat and lng are required' });
    }

    console.log('Reverse geocoding for:', lat, lng);
    console.log('API Key configured:', !!process.env.GOOGLE_MAPS_API_KEY);

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          latlng: `${lat},${lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );

    console.log('Google API response status:', response.data.status);
    if (response.data.status !== 'OK') {
      console.error('Google API error:', response.data.error_message);
    }

    res.json(response.data);
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
