import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController.js";
import { authenticateMiddleware } from "../middlewares/authenticate.js";
import { authorizeRoleMiddleware } from "../middlewares/authorize-role.js";
import { requireTenantMiddleware } from "../middlewares/require-tenant.js";

const appointmentsRoutes = Router();
const appointmentController = new AppointmentController();

appointmentsRoutes.use(authenticateMiddleware);
appointmentsRoutes.use(requireTenantMiddleware);

appointmentsRoutes.post(
  "/",
  authorizeRoleMiddleware(["owner", "admin", "recepcao"]),
  appointmentController.create,
);

appointmentsRoutes.get(
  "/available",
  authorizeRoleMiddleware(["owner", "admin", "recepcao", "barbeiro"]),
  appointmentController.available,
);

export { appointmentsRoutes };
