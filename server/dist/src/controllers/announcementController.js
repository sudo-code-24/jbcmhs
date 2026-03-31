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
exports.list = list;
exports.getOne = getOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
const announcementService = __importStar(require("../services/announcementService"));
const pushService_1 = require("../services/pushService");
async function list(req, res, next) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const items = await announcementService.getAll(limit);
        res.json(items);
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const item = await announcementService.getById(req.params.id);
        res.json(item);
    }
    catch (err) {
        next(err);
    }
}
async function create(req, res, next) {
    try {
        const { title, content, category, datePosted, imageUrl } = req.body;
        if (!title || !content || !category) {
            res.status(400).json({ error: "title, content, and category are required" });
            return;
        }
        const item = await announcementService.create({ title, content, category, datePosted, imageUrl });
        (0, pushService_1.broadcastNewAnnouncement)(item.title);
        res.status(201).json(item);
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const { title, content, category, datePosted, imageUrl } = req.body;
        const data = {};
        if (title !== undefined)
            data.title = title;
        if (content !== undefined)
            data.content = content;
        if (category !== undefined)
            data.category = category;
        if (datePosted !== undefined)
            data.datePosted = datePosted;
        if (imageUrl !== undefined)
            data.imageUrl = imageUrl;
        const item = await announcementService.update(req.params.id, data);
        res.json(item);
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await announcementService.remove(req.params.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=announcementController.js.map