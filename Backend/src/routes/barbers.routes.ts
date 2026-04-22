import { Router } from "express";
import { BarberController } from "../controllers/BarberController.js";
import { authenticateMiddleware } from "../middlewares/authenticate.js";
import { authorizeRoleMiddleware } from "../middlewares/authorize-role.js";
import { requireTenantMiddleware } from "../middlewares/require-tenant.js";

const barbersRoutes = Router();
const barberController = new BarberController();

barbersRoutes.use(authenticateMiddleware);
barbersRoutes.use(requireTenantMiddleware);

barbersRoutes.get(
  "/",
  authorizeRoleMiddleware(["owner", "admin", "recepcao", "barbeiro"]),
  barberController.index,
);

barbersRoutes.get(
  "/:id",
  authorizeRoleMiddleware(["owner", "admin", "recepcao", "barbeiro"]),
  barberController.show,
);

barbersRoutes.post(
  "/",
  authorizeRoleMiddleware(["owner", "admin"]),
  barberController.create,
);

barbersRoutes.put(
  "/:id",
  authorizeRoleMiddleware(["owner", "admin"]),
  barberController.update,
);

barbersRoutes.delete(
  "/:id",
  authorizeRoleMiddleware(["owner", "admin"]),
  barberController.delete,
);

export { barbersRoutes };
