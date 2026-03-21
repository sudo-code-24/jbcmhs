import { Router } from "express";
import * as controller from "../controllers/facultyBoardController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.get("/", controller.getBoard);
router.put("/", authMiddleware, requireRole(["admin", "faculty"]), controller.putBoard);

export default router;
