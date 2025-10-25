"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mapsController_1 = require("../controllers/mapsController");
const router = (0, express_1.Router)();
router.get('/geocode', mapsController_1.geocode);
router.get('/reverse-geocode', mapsController_1.reverseGeocode);
exports.default = router;
//# sourceMappingURL=mapsRoutes.js.map