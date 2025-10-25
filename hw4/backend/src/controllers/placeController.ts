import { Response } from 'express';
import prisma from '../db/client';
import { AuthRequest } from '../types';
import axios from 'axios';

export const getPlaces = async (req: AuthRequest, res: Response) => {
  try {
    const places = await prisma.place.findMany({
      where: {
        userId: req.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(places);
  } catch (error) {
    console.error('Get places error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPlace = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, lat, lng, address } = req.body;

    if (!title || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Title, lat, and lng are required' });
    }

    const place = await prisma.place.create({
      data: {
        title,
        description,
        category,
        lat,
        lng,
        address,
        userId: req.userId as string
      }
    });

    res.status(201).json(place);
  } catch (error) {
    console.error('Create place error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePlace = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category, address } = req.body;

    // Check if place exists and belongs to user
    const existingPlace = await prisma.place.findUnique({
      where: { id }
    });

    if (!existingPlace) {
      return res.status(404).json({ error: 'Place not found' });
    }

    if (existingPlace.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const place = await prisma.place.update({
      where: { id },
      data: {
        title,
        description,
        category,
        address
      }
    });

    res.json(place);
  } catch (error) {
    console.error('Update place error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePlace = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if place exists and belongs to user
    const existingPlace = await prisma.place.findUnique({
      where: { id }
    });

    if (!existingPlace) {
      return res.status(404).json({ error: 'Place not found' });
    }

    if (existingPlace.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.place.delete({
      where: { id }
    });

    res.json({ message: 'Place deleted successfully' });
  } catch (error) {
    console.error('Delete place error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
