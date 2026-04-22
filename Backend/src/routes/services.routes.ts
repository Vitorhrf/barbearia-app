import { Router } from "express";
import { ServiceController } from "../controllers/ServiceController.js";
import { authenticateMiddleware } from "../middlewares/authenticate.js";
import { authorizeRoleMiddleware } from "../middlewares/authorize-role.js";
import { requireTenantMiddleware } from "../middlewares/require-tenant.js";

const servicesRoutes = Router();
const serviceController = new ServiceController();

servicesRoutes.use(authenticateMiddleware);
servicesRoutes.use(requireTenantMiddleware);

servicesRoutes.get(
  "/",
  authorizeRoleMiddleware(["owner", "admin", "recepcao", "barbeiro"]),
  serviceController.index,
);

servicesRoutes.get(
  "/:id",
  authorizeRoleMiddleware(["owner", "admin", "recepcao", "barbeiro"]),
  serviceController.show,
);

servicesRoutes.post(
  "/",
  authorizeRoleMiddleware(["owner", "admin"]),
  serviceController.create,
);

servicesRoutes.put(
  "/:id",
  authorizeRoleMiddleware(["owner", "admin"]),
  serviceController.update,
);

servicesRoutes.delete(
  "/:id",
  authorizeRoleMiddleware(["owner", "admin"]),
  serviceController.delete,
);

export { servicesRoutes };
