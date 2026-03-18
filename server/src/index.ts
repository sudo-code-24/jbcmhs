import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import announcementsRouter from "./routes/announcements";
import eventsRouter from "./routes/events";
import schoolInfoRouter from "./routes/schoolInfo";
import imagesRouter from "./routes/images";

const app = express();
const PORT = process.env.PORT ?? 5005;

app.use(cors({ origin: true }));
app.use(express.json());

app.use("/api/announcements", announcementsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/school-info", schoolInfoRouter);
app.use("/api/images", imagesRouter);

app.get("/api/health", (_: Request, res: Response) => res.json({ status: "ok" }));

app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? "Internal server error" });
});

app.listen(PORT as number, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
