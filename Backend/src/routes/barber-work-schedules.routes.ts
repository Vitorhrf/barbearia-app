import { Router } from "express";
import { BarberWorkScheduleController } from "../controllers/BarberWorkScheduleController.js";
import { authenticateMiddleware } from "../middlewares/authenticate.js";
import { authorizeRoleMiddleware } from "../middlewares/authorize-role.js";
import { requireTenantMiddleware } from "../middlewares/require-tenant.js";

const barberWorkSchedulesRoutes = Router();
const barberWorkScheduleController = new BarberWorkScheduleController();

barberWorkSchedulesRoutes.use(authenticateMiddleware);
barberWorkSchedulesRoutes.use(requireTenantMiddleware);

barberWorkSchedulesRoutes.get(
  "/barbers/:id/work-schedules",
  authorizeRoleMiddleware(["owner", "admin", "recepcao", "barbeiro"]),
  barberWorkScheduleController.index,
);

barberWorkSchedulesRoutes.post(
  "/barbers/:id/work-schedules",
  authorizeRoleMiddleware(["owner", "admin"]),
  barberWorkScheduleController.create,
);

barberWorkSchedulesRoutes.put(
  "/barbers/:id/work-schedules/:scheduleId",
  authorizeRoleMiddleware(["owner", "admin"]),
  barberWorkScheduleController.update,
);

barberWorkSchedulesRoutes.delete(
  "/barbers/:id/work-schedules/:scheduleId",
  authorizeRoleMiddleware(["owner", "admin"]),
  barberWorkScheduleController.delete,
);

export { barberWorkSchedulesRoutes };
