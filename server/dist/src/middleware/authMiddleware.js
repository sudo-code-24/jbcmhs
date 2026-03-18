"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../lib/jwt");
const sessionService_1 = require("../services/sessionService");
function getBearerToken(authorizationHeader) {
    if (!authorizationHeader)
        return "";
    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token)
        return "";
    return token.trim();
}
function getCookieValue(cookieHeader, key) {
    if (!cookieHeader)
        return "";
    const pairs = cookieHeader.split(";").map((part) => part.trim());
    for (const pair of pairs) {
        const [name, ...valueParts] = pair.split("=");
        if (name === key) {
            return decodeURIComponent(valueParts.join("=") || "");
        }
    }
    return "";
}
function getSessionId(req) {
    const fromHeader = String(req.headers["x-session-id"] ?? "").trim();
    if (fromHeader)
        return fromHeader;
    const fromCookie = getCookieValue(req.headers.cookie, "sessionId");
    return fromCookie.trim();
}
async function authMiddleware(req, res, next) {
    try {
        const token = getBearerToken(req.header("authorization"));
        const sessionId = getSessionId(req);
        if (!token || !sessionId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const payload = (0, jwt_1.verifyAuthToken)(token);
        const session = await (0, sessionService_1.getSession)(sessionId);
        if (!(0, sessionService_1.isSessionValid)(session)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!session || session.jwtToken !== token || session.userEmail !== payload.email) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const authReq = req;
        authReq.user = {
            email: payload.email,
            sessionId: session.sessionId,
        };
        next();
    }
    catch {
        res.status(401).json({ error: "Unauthorized" });
    }
}
//# sourceMappingURL=authMiddleware.js.map