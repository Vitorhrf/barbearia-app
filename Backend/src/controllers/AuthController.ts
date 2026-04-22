import type { Handler } from "express";
import { LoginRequestSchema } from "./schemas/AuthRequestSchema.js";
import { AuthService } from "../services/AuthService.js";
import { HttpError } from "../errors/HttpError.js";

const authService = new AuthService();

export class AuthController {
  login: Handler = async (req, res, next) => {
    try {
      const body = LoginRequestSchema.parse(req.body);
      const result = await authService.login(body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  me: Handler = async (req, res, next) => {
    try {
      if (!req.auth) {
        throw new HttpError(401, "Usuario nao autenticado");
      }

      const tenantIdHeader = req.headers["x-barbearia-id"];
      const tenantIdRaw = Array.isArray(tenantIdHeader) ? tenantIdHeader[0] : tenantIdHeader;
      const tenantId = tenantIdRaw ? Number(tenantIdRaw) : undefined;

      const result = await authService.getAuthenticatedUserContext(req.auth.userId, tenantId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  tenantContext: Handler = async (req, res, next) => {
    try {
      if (!req.auth || !req.tenant) {
        throw new HttpError(401, "Contexto de autenticacao incompleto");
      }

      res.status(200).json({
        user: req.auth,
        tenant: req.tenant,
      });
    } catch (error) {
      next(error);
    }
  };
}
