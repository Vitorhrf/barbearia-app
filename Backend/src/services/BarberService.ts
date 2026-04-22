import bcrypt from "bcrypt";
import { prisma } from "../database/index.js";
import { HttpError } from "../errors/HttpError.js";
import { PrismaBarbeiroRepository } from "../repositories/prisma/PrismaBarbeiroRepository.js";

interface GetBarbersParams {
  idBarbearia: number;
  page?: number;
  pageSize?: number;
  nome?: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  sortBy?: "idBarbeiro" | "telefone" | "especialidade" | "comissao" | "nome" | "email" | "dataCriacao";
  order?: "asc" | "desc";
}

interface CreateBarberParams {
  idBarbearia: number;
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  especialidade?: string;
  comissao?: number;
}

interface UpdateBarberParams {
  idBarbearia: number;
  idBarbeiro: number;
  nome?: string;
  email?: string;
  senha?: string;
  telefone?: string;
  especialidade?: string;
  comissao?: number;
}

const barbeiroRepository = new PrismaBarbeiroRepository();
const SALT_ROUNDS = 10;

export class BarberService {
  async getBarbers(params: GetBarbersParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;
    const sortByMap = {
      idBarbeiro: "idBarbeiro",
      telefone: "telefone",
      especialidade: "especialidade",
      comissao: "comissao",
      nome: "nome",
      email: "email",
      dataCriacao: "dataCriacao",
    } as const;

    const [items, total] = await Promise.all([
      barbeiroRepository.find({
        where: {
          idBarbearia: params.idBarbearia,
          telefone: params.telefone ? { like: params.telefone } : undefined,
          especialidade: params.especialidade ? { like: params.especialidade } : undefined,
        },
        usuarioWhere: {
          nome: params.nome,
          email: params.email,
          ativo: true,
        },
        usuarioSortBy:
          params.sortBy === "nome" || params.sortBy === "email" || params.sortBy === "dataCriacao"
            ? sortByMap[params.sortBy]
            : undefined,
        sortBy:
          params.sortBy && params.sortBy !== "nome" && params.sortBy !== "email" && params.sortBy !== "dataCriacao"
            ? sortByMap[params.sortBy]
            : undefined,
        order: params.order,
        limit: pageSize,
        offset,
      }),
      barbeiroRepository.count({
        idBarbearia: params.idBarbearia,
        telefone: params.telefone ? { like: params.telefone } : undefined,
        especialidade: params.especialidade ? { like: params.especialidade } : undefined,
        usuarioWhere: {
          nome: params.nome,
          email: params.email,
          ativo: true,
        },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getBarberById(idBarbearia: number, idBarbeiro: number) {
    const barbeiro = await barbeiroRepository.findById(idBarbeiro, idBarbearia);

    if (!barbeiro) {
      throw new HttpError(404, "Barbeiro nao encontrado");
    }

    return barbeiro;
  }

  async createBarber(data: CreateBarberParams) {
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
      include: {
        barbeiro: {
          where: { idBarbearia: data.idBarbearia },
        },
      },
    });

    if (existingUser?.barbeiro.length) {
      throw new HttpError(409, "Ja existe um barbeiro com este email nesta barbearia");
    }

    const senhaHash = await bcrypt.hash(data.senha, SALT_ROUNDS);

    return prisma.$transaction(async (tx) => {
      const usuario =
        existingUser ??
        (await tx.usuario.create({
          data: {
            nome: data.nome,
            email: data.email,
            senhaHash,
            tipoUsuario: "barbeiro",
          },
        }));

      if (existingUser) {
        await tx.usuario.update({
          where: { idUsuario: existingUser.idUsuario },
          data: {
            nome: data.nome,
            senhaHash,
            tipoUsuario: "barbeiro",
            ativo: true,
          },
        });
      }

      await tx.usuarioBarbearia.upsert({
        where: {
          idUsuario_idBarbearia: {
            idUsuario: usuario.idUsuario,
            idBarbearia: data.idBarbearia,
          },
        },
        update: {
          papel: "barbeiro",
          ativo: true,
        },
        create: {
          idUsuario: usuario.idUsuario,
          idBarbearia: data.idBarbearia,
          papel: "barbeiro",
        },
      });

      return tx.barbeiro.create({
        data: {
          idUsuario: usuario.idUsuario,
          idBarbearia: data.idBarbearia,
          telefone: data.telefone,
          especialidade: data.especialidade,
          comissao: data.comissao,
        },
        include: {
          usuario: {
            select: {
              idUsuario: true,
              nome: true,
              email: true,
              tipoUsuario: true,
              ativo: true,
              dataCriacao: true,
            },
          },
        },
      });
    });
  }

  async updateBarber(data: UpdateBarberParams) {
    const barbeiro = await this.getBarberById(data.idBarbearia, data.idBarbeiro);

    if (data.email && data.email !== barbeiro.usuario.email) {
      const existingUser = await prisma.usuario.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.idUsuario !== barbeiro.idUsuario) {
        throw new HttpError(409, "Ja existe um usuario com este email");
      }
    }

    const senhaHash = data.senha ? await bcrypt.hash(data.senha, SALT_ROUNDS) : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { idUsuario: barbeiro.idUsuario },
        data: {
          nome: data.nome,
          email: data.email,
          senhaHash,
        },
      });

      await tx.barbeiro.update({
        where: { idBarbeiro: barbeiro.idBarbeiro },
        data: {
          telefone: data.telefone,
          especialidade: data.especialidade,
          comissao: data.comissao,
        },
      });
    });

    return this.getBarberById(data.idBarbearia, data.idBarbeiro);
  }

  async deleteBarber(idBarbearia: number, idBarbeiro: number) {
    const barbeiro = await barbeiroRepository.deleteById(idBarbeiro, idBarbearia);

    if (!barbeiro) {
      throw new HttpError(404, "Barbeiro nao encontrado");
    }

    await prisma.usuarioBarbearia.updateMany({
      where: {
        idUsuario: barbeiro.idUsuario,
        idBarbearia,
      },
      data: {
        ativo: false,
      },
    });

    return barbeiro;
  }
}
