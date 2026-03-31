import { Router } from "express";
import {
  getStatus,
  getVapidPublicKey,
  postTestNotification,
  subscribe,
} from "../controllers/pushController";

const router = Router();

router.get("/vapid-public-key", getVapidPublicKey);
router.get("/status", getStatus);
router.post("/subscribe", subscribe);
router.post("/test", postTestNotification);

export default router;
