import { Router } from "express";
import * as controller from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.post("/signup", authMiddleware, requireRole(["admin"]), controller.signup);
router.post("/login", controller.login);
router.post("/change-password", controller.changePassword);
router.post("/logout", authMiddleware, controller.logout);
router.get("/me", authMiddleware, controller.me);
router.get("/users", authMiddleware, requireRole(["admin"]), controller.listUsers);
router.delete("/users/:username", authMiddleware, requireRole(["admin"]), controller.deleteUser);
router.post("/users/:username/reset-password", authMiddleware, requireRole(["admin"]), controller.resetPassword);

export default router;
