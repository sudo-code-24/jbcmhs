import { requiredEnv } from "./googleClients";
import webpush from "web-push";

const vapidSubject =
  process.env.VAPID_SUBJECT?.trim() || "mailto:admin@localhost";

webpush.setVapidDetails(
  vapidSubject,
  requiredEnv("VAPID_PUBLIC_KEY"),
  requiredEnv("VAPID_PRIVATE_KEY"),
);

export default webpush;
