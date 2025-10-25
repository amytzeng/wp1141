import api from './client';

export const geocode = async (address: string) => {
  const response = await api.get('/maps/geocode', {
    params: { address },
  });
  return response.data;
};

export const reverseGeocode = async (lat: number, lng: number) => {
  const response = await api.get('/maps/reverse-geocode', {
    params: { lat, lng },
  });
  return response.data;
};
