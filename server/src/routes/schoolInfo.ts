import { Router } from "express";
import * as controller from "../controllers/schoolInfoController";

const router = Router();

router.get("/", controller.get);
router.put("/", controller.upsert);

export default router;
