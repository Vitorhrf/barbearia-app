import { Router } from "express";
import { agendaBlocksRoutes } from "./routes/agenda-blocks.routes.js";
import { appointmentsRoutes } from "./routes/appointments.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { barbersRoutes } from "./routes/barbers.routes.js";
import { barberWorkSchedulesRoutes } from "./routes/barber-work-schedules.routes.js";
import { clientsRoutes } from "./routes/clients.routes.js";
import { servicesRoutes } from "./routes/services.routes.js";

export const router = Router()

router.use(agendaBlocksRoutes)
router.use("/appointments", appointmentsRoutes)
router.use("/auth", authRoutes)
router.use("/barbers", barbersRoutes)
router.use(barberWorkSchedulesRoutes)
router.use("/clients", clientsRoutes)
router.use("/services", servicesRoutes)
