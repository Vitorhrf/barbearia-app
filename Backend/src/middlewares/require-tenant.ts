import type { RequestHandler } from "express";
import { HttpError } from "../errors/HttpError.js";
import { AuthService } from "../services/AuthService.js";

const authService = new AuthService();

export const requireTenantMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.auth) {
      throw new HttpError(401, "Usuario nao autenticado");
    }

    const tenantHeader = req.headers["x-barbearia-id"];
    const tenantIdRaw = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;

    if (!tenantIdRaw) {
      throw new HttpError(400, "Cabecalho x-barbearia-id e obrigatorio");
    }

    const tenantId = Number(tenantIdRaw);

    if (!Number.isInteger(tenantId) || tenantId <= 0) {
      throw new HttpError(400, "Cabecalho x-barbearia-id invalido");
    }

    req.tenant = await authService.getTenantAccessForUser(req.auth.userId, tenantId);

    next();
  } catch (error) {
    next(error);
  }
};
