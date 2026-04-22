import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authenticateMiddleware } from "../middlewares/authenticate.js";
import { requireTenantMiddleware } from "../middlewares/require-tenant.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/login", authController.login);
authRoutes.get("/me", authenticateMiddleware, authController.me);
authRoutes.get("/tenant-context", authenticateMiddleware, requireTenantMiddleware, authController.tenantContext);

export { authRoutes };
