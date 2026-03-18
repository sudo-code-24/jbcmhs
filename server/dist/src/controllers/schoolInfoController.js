"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
exports.upsert = upsert;
const schoolInfoService = __importStar(require("../services/schoolInfoService"));
async function get(req, res, next) {
    try {
        const info = await schoolInfoService.get();
        res.json(info);
    }
    catch (err) {
        next(err);
    }
}
async function upsert(req, res, next) {
    try {
        const { name, history, mission, vision, phone, email, address, officeHours, heroImageUrl, schoolImageUrl } = req.body;
        const data = { name, history, mission, vision, phone, email, address, officeHours, heroImageUrl, schoolImageUrl };
        const filtered = Object.fromEntries(Object.entries(data).filter(([, v]) => v != null && v !== ""));
        if (Object.keys(filtered).length === 0) {
            res.status(400).json({ error: "At least one field is required" });
            return;
        }
        const info = await schoolInfoService.upsert(filtered);
        res.json(info);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=schoolInfoController.js.map