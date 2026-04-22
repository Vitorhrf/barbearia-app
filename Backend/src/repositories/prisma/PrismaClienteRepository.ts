import { prisma } from "../../database"
import { CreateClienteAttributes, FindClienteParams, ClienteRepository, ClienteWhereParams, ClienteWithUsuario } from "../ClienteRepository"

export class PrismaClienteRepository implements ClienteRepository {

    private usuarioInclude = {
        usuario: {
            select: {
                idUsuario: true,
                nome: true,
                email: true,
                tipoUsuario: true,
                ativo: true,
                dataCriacao: true
            }
        }
    }

    async find(params?: FindClienteParams & {
        usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean };
        usuarioSortBy?: "nome" | "email" | "dataCriacao" | "ativo";
    }): Promise<ClienteWithUsuario[]> {
        return await prisma.cliente.findMany({
            where: {
                idBarbearia: params?.where?.idBarbearia,
                telefone: params?.where?.telefone ? { contains: params.where.telefone.like, mode: "insensitive" } : undefined,
                observacoes: params?.where?.observacoes ? { contains: params.where.observacoes.like, mode: "insensitive" } : undefined,
                dataNascimento: params?.where?.dataNascimento
                    ? { gte: params.where.dataNascimento.gte, lte: params.where.dataNascimento.lte }
                    : undefined,
                usuario: params?.usuarioWhere
                    ? {
                        nome: params.usuarioWhere.nome
                            ? { contains: params.usuarioWhere.nome, mode: "insensitive" }
                            : undefined,
                        email: params.usuarioWhere.email
                            ? { contains: params.usuarioWhere.email, mode: "insensitive" }
                            : undefined,
                        ativo: params.usuarioWhere.ativo,
                        dataCriacao: params.usuarioWhere.dataCriacao
                            ? {
                                gte: params.usuarioWhere.dataCriacao.gte,
                                lte: params.usuarioWhere.dataCriacao.lte,
                            }
                            : undefined
                    }
                    : undefined
            },
            orderBy:
                params?.usuarioSortBy
                    ? { usuario: { [params.usuarioSortBy]: params.order || "asc" } }
                    : params?.sortBy
                        ? { [params.sortBy]: params.order || "asc" }
                        : undefined,
            take: params?.limit,
            skip: params?.offset,
            include: this.usuarioInclude
        })
    }

    async findById(id: number, idBarbearia?: number): Promise<ClienteWithUsuario | null> {
        return await prisma.cliente.findFirst({
            where: {
                idCliente: id,
                idBarbearia,
            },
            include: this.usuarioInclude
        })
    }

    async create(data: CreateClienteAttributes): Promise<ClienteWithUsuario> {
        return await prisma.cliente.create({
            data,
            include: this.usuarioInclude
        })
    }

    async count(where: ClienteWhereParams & {
        usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean };
    }): Promise<number> {
        return await prisma.cliente.count({
            where: {
                telefone: where?.telefone
                    ? { contains: where.telefone.like, mode: "insensitive" }
                    : undefined,
                idBarbearia: where?.idBarbearia,
                observacoes: where?.observacoes
                    ? { contains: where.observacoes.like, mode: "insensitive" }
                    : undefined,
                dataNascimento: where?.dataNascimento
                    ? {
                        gte: where.dataNascimento.gte,
                        lte: where.dataNascimento.lte,
                    }
                    : undefined,
                usuario: where?.usuarioWhere
                    ? {
                        nome: where.usuarioWhere.nome
                            ? { contains: where.usuarioWhere.nome, mode: "insensitive" }
                            : undefined,
                        email: where.usuarioWhere.email
                            ? { contains: where.usuarioWhere.email, mode: "insensitive" }
                            : undefined,
                        ativo: where.usuarioWhere.ativo,
                        dataCriacao: where.usuarioWhere.dataCriacao
                            ? {
                                gte: where.usuarioWhere.dataCriacao.gte,
                                lte: where.usuarioWhere.dataCriacao.lte,
                            }
                            : undefined,
                    }
                    : undefined
            }
        })
    }

    async updateById(id: number, idBarbearia: number, data: Partial<CreateClienteAttributes>): Promise<ClienteWithUsuario | null> {
        const cliente = await this.findById(id, idBarbearia)
        if (!cliente) return null

        return await prisma.cliente.update({
            where: { idCliente: id },
            data,
            include: this.usuarioInclude
        })
    }

    async deleteById(id: number, idBarbearia: number): Promise<ClienteWithUsuario | null> {
        const cliente = await this.findById(id, idBarbearia)
        if (!cliente) return null
        await prisma.usuario.update({
            where: { idUsuario: cliente?.idUsuario },
            data: { ativo: false }
        })
        return cliente
    }
}
