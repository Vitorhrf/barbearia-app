import { Router } from "express";
import { AgendaBlockController } from "../controllers/AgendaBlockController.js";
import { authenticateMiddleware } from "../middlewares/authenticate.js";
import { authorizeRoleMiddleware } from "../middlewares/authorize-role.js";
import { requireTenantMiddleware } from "../middlewares/require-tenant.js";

const agendaBlocksRoutes = Router();
const agendaBlockController = new AgendaBlockController();

agendaBlocksRoutes.use(authenticateMiddleware);
agendaBlocksRoutes.use(requireTenantMiddleware);

agendaBlocksRoutes.get(
  "/agenda-blocks",
  authorizeRoleMiddleware(["owner", "admin", "recepcao", "barbeiro"]),
  agendaBlockController.index,
);

agendaBlocksRoutes.post(
  "/agenda-blocks",
  authorizeRoleMiddleware(["owner", "admin"]),
  agendaBlockController.create,
);

agendaBlocksRoutes.put(
  "/agenda-blocks/:blockId",
  authorizeRoleMiddleware(["owner", "admin"]),
  agendaBlockController.update,
);

agendaBlocksRoutes.delete(
  "/agenda-blocks/:blockId",
  authorizeRoleMiddleware(["owner", "admin"]),
  agendaBlockController.delete,
);

export { agendaBlocksRoutes };
