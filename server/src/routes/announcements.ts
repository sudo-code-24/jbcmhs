import { Router } from "express";
import * as controller from "../controllers/announcementController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.post("/", authMiddleware, requireRole(["admin", "faculty"]), controller.create);
router.put("/:id", authMiddleware, requireRole(["admin", "faculty"]), controller.update);
router.delete("/:id", authMiddleware, requireRole(["admin", "faculty"]), controller.remove);

export default router;
