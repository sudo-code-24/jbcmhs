import { Router } from "express";
import * as controller from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/change-password", controller.changePassword);
router.post("/logout", authMiddleware, controller.logout);
router.get("/users", authMiddleware, controller.listUsers);
router.delete("/users/:username", authMiddleware, controller.deleteUser);
router.post("/users/:username/reset-password", authMiddleware, controller.resetPassword);

export default router;
