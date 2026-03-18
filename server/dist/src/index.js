"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const announcements_1 = __importDefault(require("./routes/announcements"));
const events_1 = __importDefault(require("./routes/events"));
const schoolInfo_1 = __importDefault(require("./routes/schoolInfo"));
const images_1 = __importDefault(require("./routes/images"));
const auth_1 = __importDefault(require("./routes/auth"));
const authService_1 = require("./services/authService");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 5005;
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
app.use("/api/announcements", announcements_1.default);
app.use("/api/events", events_1.default);
app.use("/api/school-info", schoolInfo_1.default);
app.use("/api/images", images_1.default);
app.use("/api/auth", auth_1.default);
app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status ?? 500).json({ error: err.message ?? "Internal server error" });
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    (0, authService_1.ensureDefaultAdminAccount)()
        .then(() => {
        console.log("Auth initialization complete");
    })
        .catch((err) => {
        console.error("Failed to initialize auth:", err);
    });
});
//# sourceMappingURL=index.js.map