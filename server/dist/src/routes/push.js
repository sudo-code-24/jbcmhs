"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pushController_1 = require("../controllers/pushController");
const router = (0, express_1.Router)();
router.get("/vapid-public-key", pushController_1.getVapidPublicKey);
router.post("/subscribe", pushController_1.subscribe);
exports.default = router;
//# sourceMappingURL=push.js.map