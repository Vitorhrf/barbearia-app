import jwt from "jsonwebtoken";
import { HttpError } from "../errors/HttpError.js";
import { getRequiredEnv } from "../config/env.js";

interface AuthTokenPayload {
  sub: number;
  email: string;
  tipoUsuario: string;
}

const TOKEN_EXPIRES_IN = "8h";

export function createAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getRequiredEnv("AUTH_SECRET"), {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, getRequiredEnv("AUTH_SECRET"));

    if (typeof decoded === "string") {
      throw new HttpError(401, "Token invalido");
    }

    const { sub, email, tipoUsuario } = decoded;

    if (typeof sub !== "number" || typeof email !== "string" || typeof tipoUsuario !== "string") {
      throw new HttpError(401, "Token invalido");
    }

    return {
      sub,
      email,
      tipoUsuario,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Token expirado");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, "Token invalido");
    }

    throw error;
  }
}
