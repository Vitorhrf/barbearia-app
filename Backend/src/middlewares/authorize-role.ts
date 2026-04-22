import type { PapelBarbearia } from "@prisma/client";
import type { RequestHandler } from "express";
import { HttpError } from "../errors/HttpError.js";

export function authorizeRoleMiddleware(roles: PapelBarbearia[]): RequestHandler {
  return (req, _res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      if (!roles.includes(req.tenant.papel)) {
        throw new HttpError(403, "Usuario sem permissao para este recurso");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
