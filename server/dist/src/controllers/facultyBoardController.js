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
exports.getBoard = getBoard;
exports.putBoard = putBoard;
const facultyBoardService = __importStar(require("../services/facultyBoardService"));
function isCardItem(x) {
    if (!x || typeof x !== "object")
        return false;
    const o = x;
    return (typeof o.id === "string" &&
        typeof o.name === "string" &&
        typeof o.role === "string" &&
        typeof o.department === "string" &&
        typeof o.boardSection === "string" &&
        typeof o.positionIndex === "number" &&
        Number.isFinite(o.positionIndex));
}
async function getBoard(_req, res, next) {
    try {
        const board = await facultyBoardService.getBoard();
        res.json(board);
    }
    catch (err) {
        next(err);
    }
}
async function putBoard(req, res, next) {
    try {
        const body = req.body;
        if (!body || typeof body !== "object") {
            res.status(400).json({ error: "Invalid body" });
            return;
        }
        const { rows, cards } = body;
        if (!Array.isArray(rows) || !rows.every((r) => typeof r === "string")) {
            res.status(400).json({ error: "rows must be an array of strings" });
            return;
        }
        if (!Array.isArray(cards) || !cards.every(isCardItem)) {
            res.status(400).json({ error: "cards must be an array of faculty card objects" });
            return;
        }
        await facultyBoardService.saveBoard({
            rows,
            cards: cards.map((c) => ({
                ...c,
                email: c.email?.trim() ? c.email : undefined,
                phone: c.phone?.trim() ? c.phone : undefined,
                photoUrl: c.photoUrl?.trim() ? c.photoUrl : undefined,
            })),
        });
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=facultyBoardController.js.map