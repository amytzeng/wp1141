"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlace = exports.updatePlace = exports.createPlace = exports.getPlaces = void 0;
const client_1 = __importDefault(require("../db/client"));
const getPlaces = async (req, res) => {
    try {
        const places = await client_1.default.place.findMany({
            where: {
                userId: req.userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(places);
    }
    catch (error) {
        console.error('Get places error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPlaces = getPlaces;
const createPlace = async (req, res) => {
    try {
        const { title, description, category, lat, lng, address } = req.body;
        if (!title || typeof lat !== 'number' || typeof lng !== 'number') {
            return res.status(400).json({ error: 'Title, lat, and lng are required' });
        }
        const place = await client_1.default.place.create({
            data: {
                title,
                description,
                category,
                lat,
                lng,
                address,
                userId: req.userId
            }
        });
        res.status(201).json(place);
    }
    catch (error) {
        console.error('Create place error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createPlace = createPlace;
const updatePlace = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, address } = req.body;
        // Check if place exists and belongs to user
        const existingPlace = await client_1.default.place.findUnique({
            where: { id }
        });
        if (!existingPlace) {
            return res.status(404).json({ error: 'Place not found' });
        }
        if (existingPlace.userId !== req.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const place = await client_1.default.place.update({
            where: { id },
            data: {
                title,
                description,
                category,
                address
            }
        });
        res.json(place);
    }
    catch (error) {
        console.error('Update place error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updatePlace = updatePlace;
const deletePlace = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if place exists and belongs to user
        const existingPlace = await client_1.default.place.findUnique({
            where: { id }
        });
        if (!existingPlace) {
            return res.status(404).json({ error: 'Place not found' });
        }
        if (existingPlace.userId !== req.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await client_1.default.place.delete({
            where: { id }
        });
        res.json({ message: 'Place deleted successfully' });
    }
    catch (error) {
        console.error('Delete place error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deletePlace = deletePlace;
//# sourceMappingURL=placeController.js.map