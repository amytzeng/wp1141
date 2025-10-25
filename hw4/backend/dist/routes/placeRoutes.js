"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const placeController_1 = require("../controllers/placeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', placeController_1.getPlaces);
router.post('/', placeController_1.createPlace);
router.put('/:id', placeController_1.updatePlace);
router.delete('/:id', placeController_1.deletePlace);
exports.default = router;
//# sourceMappingURL=placeRoutes.js.map