import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import announcementsRouter from "./routes/announcements";
import eventsRouter from "./routes/events";
import schoolInfoRouter from "./routes/schoolInfo";
import imagesRouter from "./routes/images";
import authRouter from "./routes/auth";
import { ensureDefaultAdminAccount } from "./services/authService";

const app = express();
const PORT = process.env.PORT ?? 5005;

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
  })
);
app.use(express.json());

app.use("/api/announcements", announcementsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/school-info", schoolInfoRouter);
app.use("/api/images", imagesRouter);
app.use("/api/auth", authRouter);

app.get("/api/health", (_: Request, res: Response) => res.json({ status: "ok" }));

app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? "Internal server error" });
});

app.listen(PORT as number, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  ensureDefaultAdminAccount()
    .then(() => {
      console.log("Auth initialization complete");
    })
    .catch((err) => {
      console.error("Failed to initialize auth:", err);
    });
});
