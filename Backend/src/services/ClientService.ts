import bcrypt from "bcrypt";
import { prisma } from "../database/index.js";
import { HttpError } from "../errors/HttpError.js";
import { PrismaClienteRepository } from "../repositories/prisma/PrismaClienteRepository.js";

interface GetClientsParams {
  idBarbearia: number;
  page?: number;
  pageSize?: number;
  nome?: string;
  email?: string;
  telefone?: string;
  sortBy?: "idCliente" | "telefone" | "dataNascimento" | "observacoes" | "nome" | "email" | "dataCriacao";
  order?: "asc" | "desc";
}

interface CreateClientParams {
  idBarbearia: number;
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  dataNascimento?: Date;
  observacoes?: string;
}

interface UpdateClientParams {
  idBarbearia: number;
  idCliente: number;
  nome?: string;
  email?: string;
  senha?: string;
  telefone?: string;
  dataNascimento?: Date;
  observacoes?: string;
}

const clienteRepository = new PrismaClienteRepository();
const SALT_ROUNDS = 10;

export class ClientService {
  async getClients(params: GetClientsParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;
    const sortByMap = {
      idCliente: "idCliente",
      telefone: "telefone",
      dataNascimento: "dataNascimento",
      observacoes: "observacoes",
      nome: "nome",
      email: "email",
      dataCriacao: "dataCriacao",
    } as const;

    const [items, total] = await Promise.all([
      clienteRepository.find({
        where: {
          idBarbearia: params.idBarbearia,
          telefone: params.telefone ? { like: params.telefone } : undefined,
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
      clienteRepository.count({
        idBarbearia: params.idBarbearia,
        telefone: params.telefone ? { like: params.telefone } : undefined,
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

  async getClientById(idBarbearia: number, idCliente: number) {
    const cliente = await clienteRepository.findById(idCliente, idBarbearia);

    if (!cliente) {
      throw new HttpError(404, "Cliente nao encontrado");
    }

    return cliente;
  }

  async createClient(data: CreateClientParams) {
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
      include: {
        cliente: {
          where: { idBarbearia: data.idBarbearia },
        },
      },
    });

    if (existingUser?.cliente.length) {
      throw new HttpError(409, "Ja existe um cliente com este email nesta barbearia");
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
            tipoUsuario: "cliente",
          },
        }));

      if (existingUser) {
        await tx.usuario.update({
          where: { idUsuario: existingUser.idUsuario },
          data: {
            nome: data.nome,
            senhaHash,
            tipoUsuario: "cliente",
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
          papel: "cliente",
          ativo: true,
        },
        create: {
          idUsuario: usuario.idUsuario,
          idBarbearia: data.idBarbearia,
          papel: "cliente",
        },
      });

      return tx.cliente.create({
        data: {
          idUsuario: usuario.idUsuario,
          idBarbearia: data.idBarbearia,
          telefone: data.telefone,
          dataNascimento: data.dataNascimento,
          observacoes: data.observacoes,
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

  async updateClient(data: UpdateClientParams) {
    const cliente = await this.getClientById(data.idBarbearia, data.idCliente);

    if (data.email && data.email !== cliente.usuario.email) {
      const existingUser = await prisma.usuario.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.idUsuario !== cliente.idUsuario) {
        throw new HttpError(409, "Ja existe um usuario com este email");
      }
    }

    const senhaHash = data.senha ? await bcrypt.hash(data.senha, SALT_ROUNDS) : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { idUsuario: cliente.idUsuario },
        data: {
          nome: data.nome,
          email: data.email,
          senhaHash,
        },
      });

      await tx.cliente.update({
        where: { idCliente: cliente.idCliente },
        data: {
          telefone: data.telefone,
          dataNascimento: data.dataNascimento,
          observacoes: data.observacoes,
        },
      });
    });

    return this.getClientById(data.idBarbearia, data.idCliente);
  }

  async deleteClient(idBarbearia: number, idCliente: number) {
    const cliente = await clienteRepository.deleteById(idCliente, idBarbearia);

    if (!cliente) {
      throw new HttpError(404, "Cliente nao encontrado");
    }

    await prisma.usuarioBarbearia.updateMany({
      where: {
        idUsuario: cliente.idUsuario,
        idBarbearia,
      },
      data: {
        ativo: false,
      },
    });

    return cliente;
  }
}
