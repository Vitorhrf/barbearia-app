import { Router } from "express";
import { ClientController } from "../controllers/ClientController.js";
import { authenticateMiddleware } from "../middlewares/authenticate.js";
import { authorizeRoleMiddleware } from "../middlewares/authorize-role.js";
import { requireTenantMiddleware } from "../middlewares/require-tenant.js";

const clientsRoutes = Router();
const clientController = new ClientController();

clientsRoutes.use(authenticateMiddleware);
clientsRoutes.use(requireTenantMiddleware);

clientsRoutes.get(
  "/",
  authorizeRoleMiddleware(["owner", "admin", "recepcao", "barbeiro"]),
  clientController.index,
);

clientsRoutes.get(
  "/:id",
  authorizeRoleMiddleware(["owner", "admin", "recepcao", "barbeiro"]),
  clientController.show,
);

clientsRoutes.post(
  "/",
  authorizeRoleMiddleware(["owner", "admin", "recepcao"]),
  clientController.create,
);

clientsRoutes.put(
  "/:id",
  authorizeRoleMiddleware(["owner", "admin"]),
  clientController.update,
);

clientsRoutes.delete(
  "/:id",
  authorizeRoleMiddleware(["owner", "admin"]),
  clientController.delete,
);

export { clientsRoutes };
