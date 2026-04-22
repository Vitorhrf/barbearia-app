import { Router } from "express";
import { authRoutes } from "./routes/auth.routes.js";
import { barbersRoutes } from "./routes/barbers.routes.js";
import { clientsRoutes } from "./routes/clients.routes.js";
import { servicesRoutes } from "./routes/services.routes.js";

export const router = Router()

router.use("/auth", authRoutes)
router.use("/barbers", barbersRoutes)
router.use("/clients", clientsRoutes)
router.use("/services", servicesRoutes)
