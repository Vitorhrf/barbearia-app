import type { Barbearia, PapelBarbearia, TipoUsuario } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        email: string;
        tipoUsuario: TipoUsuario;
      };
      tenant?: {
        idBarbearia: number;
        papel: PapelBarbearia;
        barbearia: Pick<Barbearia, "idBarbearia" | "nomeFantasia" | "slug" | "ativo">;
      };
    }
  }
}

export {};
