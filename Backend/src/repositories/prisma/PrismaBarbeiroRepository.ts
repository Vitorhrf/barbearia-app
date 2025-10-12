import { Barbeiro } from "@prisma/client"
import { prisma } from "../../database"
import {
    CreateBarbeiroAttributes,
    FindBarbeiroParams,
    BarbeiroRepository,
    BarbeiroWhereParams
} from "../BarbeiroRepository"

export class PrismaBarbeiroRepository implements BarbeiroRepository {

    private usuarioInclude = {
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
    }

    async find(params?: FindBarbeiroParams & {
        usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean }
        usuarioSortBy?: "nome" | "email" | "dataCriacao" | "ativo"
    }): Promise<Barbeiro[]> {
        return await prisma.barbeiro.findMany({
            where: {
                especialidade: params?.where?.especialidade
                    ? { contains: params.where.especialidade.like, mode: "insensitive" }
                    : undefined,
                telefone: params?.where?.telefone
                    ? { contains: params.where.telefone.like, mode: "insensitive" }
                    : undefined,
                comissao: params?.where?.comissao
                    ? { gte: params.where.comissao.gte, lte: params.where.comissao.lte }
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
                            : undefined,
                    }
                    : undefined,
            },
            orderBy:
                params?.usuarioSortBy
                    ? { usuario: { [params.usuarioSortBy]: params.order || "asc" } }
                    : params?.sortBy
                        ? { [params.sortBy]: params.order || "asc" }
                        : undefined,
            take: params?.limit,
            skip: params?.offset,
            include: this.usuarioInclude,
        })
    }

    async findById(id: number): Promise<Barbeiro | null> {
        return await prisma.barbeiro.findUnique({
            where: { idBarbeiro: id },
            include: this.usuarioInclude,
        })
    }

    async create(data: CreateBarbeiroAttributes): Promise<Barbeiro> {
        return await prisma.barbeiro.create({
            data,
            include: this.usuarioInclude,
        })
    }

    async count(where: BarbeiroWhereParams & {
        usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean }
    }): Promise<number> {
        return await prisma.barbeiro.count({
            where: {
                especialidade: where?.especialidade
                    ? { contains: where.especialidade.like, mode: "insensitive" }
                    : undefined,
                telefone: where?.telefone
                    ? { contains: where.telefone.like, mode: "insensitive" }
                    : undefined,
                comissao: where?.comissao
                    ? { gte: where.comissao.gte, lte: where.comissao.lte }
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
                    : undefined,
            },
        })
    }

    async updateById(id: number, data: Partial<CreateBarbeiroAttributes>): Promise<Barbeiro | null> {
        return await prisma.barbeiro.update({
            where: { idBarbeiro: id },
            data,
            include: this.usuarioInclude,
        })
    }

    async deleteById(id: number): Promise<Barbeiro | null> {
        const barbeiro = await this.findById(id)
        if (!barbeiro) return null
        await prisma.usuario.update({
            where: { idUsuario: barbeiro.idUsuario },
            data: { ativo: false },
        })

        return barbeiro
    }
}
