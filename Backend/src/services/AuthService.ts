import bcrypt from "bcrypt";
import type { PapelBarbearia, TipoUsuario } from "@prisma/client";
import { prisma } from "../database/index.js";
import { HttpError } from "../errors/HttpError.js";
import { createAuthToken } from "../utils/token.js";

interface LoginParams {
  email: string;
  password: string;
  barbeariaId?: number;
}

export class AuthService {
  async login({ email, password, barbeariaId }: LoginParams) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        usuariosBarbearias: {
          where: { ativo: true, barbearia: { ativo: true } },
          include: {
            barbearia: {
              select: {
                idBarbearia: true,
                nomeFantasia: true,
                slug: true,
                ativo: true,
              },
            },
          },
        },
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new HttpError(401, "Credenciais invalidas");
    }

    const passwordMatches = await bcrypt.compare(password, usuario.senhaHash);

    if (!passwordMatches) {
      throw new HttpError(401, "Credenciais invalidas");
    }

    if (!usuario.usuariosBarbearias.length) {
      throw new HttpError(403, "Usuario sem acesso a nenhuma barbearia ativa");
    }

    const activeTenant =
      typeof barbeariaId === "number"
        ? usuario.usuariosBarbearias.find((item) => item.idBarbearia === barbeariaId)
        : usuario.usuariosBarbearias.length === 1
          ? usuario.usuariosBarbearias[0]
          : undefined;

    if (barbeariaId && !activeTenant) {
      throw new HttpError(403, "Usuario sem acesso a essa barbearia");
    }

    const token = createAuthToken({
      sub: usuario.idUsuario,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    });

    return {
      token,
      user: {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
      memberships: usuario.usuariosBarbearias.map((membership) => ({
        idBarbearia: membership.idBarbearia,
        papel: membership.papel,
        barbearia: membership.barbearia,
      })),
      activeTenant: activeTenant
        ? {
            idBarbearia: activeTenant.idBarbearia,
            papel: activeTenant.papel,
            barbearia: activeTenant.barbearia,
          }
        : null,
    };
  }

  async getAuthenticatedUserContext(userId: number, tenantId?: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: userId },
      include: {
        usuariosBarbearias: {
          where: { ativo: true, barbearia: { ativo: true } },
          include: {
            barbearia: {
              select: {
                idBarbearia: true,
                nomeFantasia: true,
                slug: true,
                ativo: true,
              },
            },
          },
        },
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new HttpError(401, "Usuario autenticado nao encontrado");
    }

    const activeTenant =
      typeof tenantId === "number"
        ? usuario.usuariosBarbearias.find((item) => item.idBarbearia === tenantId)
        : usuario.usuariosBarbearias.length === 1
          ? usuario.usuariosBarbearias[0]
          : undefined;

    if (tenantId && !activeTenant) {
      throw new HttpError(403, "Usuario sem acesso a essa barbearia");
    }

    return {
      user: {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
      memberships: usuario.usuariosBarbearias.map((membership) => ({
        idBarbearia: membership.idBarbearia,
        papel: membership.papel,
        barbearia: membership.barbearia,
      })),
      activeTenant: activeTenant
        ? {
            idBarbearia: activeTenant.idBarbearia,
            papel: activeTenant.papel,
            barbearia: activeTenant.barbearia,
          }
        : null,
    };
  }

  async getTenantAccessForUser(userId: number, tenantId: number) {
    const membership = await prisma.usuarioBarbearia.findUnique({
      where: {
        idUsuario_idBarbearia: {
          idUsuario: userId,
          idBarbearia: tenantId,
        },
      },
      include: {
        barbearia: {
          select: {
            idBarbearia: true,
            nomeFantasia: true,
            slug: true,
            ativo: true,
          },
        },
      },
    });

    if (!membership || !membership.ativo || !membership.barbearia.ativo) {
      throw new HttpError(403, "Usuario sem acesso a essa barbearia");
    }

    return {
      idBarbearia: membership.idBarbearia,
      papel: membership.papel,
      barbearia: membership.barbearia,
    };
  }
}

export type AuthenticatedUser = {
  userId: number;
  email: string;
  tipoUsuario: TipoUsuario;
};

export type TenantAccess = {
  idBarbearia: number;
  papel: PapelBarbearia;
  barbearia: {
    idBarbearia: number;
    nomeFantasia: string;
    slug: string;
    ativo: boolean;
  };
};
