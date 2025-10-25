import api from './client';
import type { Place } from '../types';

export const getPlaces = async (): Promise<Place[]> => {
  const response = await api.get<Place[]>('/places');
  return response.data;
};

export const createPlace = async (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<Place>('/places', place);
  return response.data;
};

export const updatePlace = async (id: string, place: Partial<Place>) => {
  const response = await api.put<Place>(`/places/${id}`, place);
  return response.data;
};

export const deletePlace = async (id: string) => {
  const response = await api.delete(`/places/${id}`);
  return response.data;
};
