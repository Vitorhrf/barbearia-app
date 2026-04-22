import type { TipoUsuario } from "@prisma/client";
import type { RequestHandler } from "express";
import { verifyAuthToken } from "../utils/token.js";
import { HttpError } from "../errors/HttpError.js";

export const authenticateMiddleware: RequestHandler = (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new HttpError(401, "Token de autenticacao nao informado");
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "Formato de token invalido");
    }

    const payload = verifyAuthToken(token);

    req.auth = {
      userId: payload.sub,
      email: payload.email,
      tipoUsuario: payload.tipoUsuario as TipoUsuario,
    };

    next();
  } catch (error) {
    next(error);
  }
};
