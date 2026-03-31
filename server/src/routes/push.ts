import { Router } from "express";
import { getVapidPublicKey, subscribe } from "../controllers/pushController";

const router = Router();

router.get("/vapid-public-key", getVapidPublicKey);
router.post("/subscribe", subscribe);

export default router;
