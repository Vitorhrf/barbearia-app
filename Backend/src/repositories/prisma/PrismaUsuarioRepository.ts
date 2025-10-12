import { Usuario } from "@prisma/client";
import { prisma } from "../../database";
import { CreateUsuarioAttributes, FindUsuarioParams, UsuarioRepository, UsuarioWhereParams } from "../UsuarioRepository";


export class PrismaUsuarioRepository implements UsuarioRepository {
    async find(params: FindUsuarioParams): Promise<Usuario[]> {
        // Implementação da busca de usuários usando Prisma
        return prisma.usuario.findMany({
            where: {
                nome: params.where?.nome ? { contains: params.where.nome.like, mode: 'insensitive' } : undefined,
                email: params.where?.email ? { contains: params.where.email.like, mode: 'insensitive' } : undefined,
                dataCriacao: params?.where?.dataCriacao
                    ? { gte: params.where.dataCriacao.gte, lte: params.where.dataCriacao.lte }
                    : undefined,
                ativo: params.where?.ativo,
                tipoUsuario: params.where?.tipoUsuario,
            },
            orderBy: params.sortBy ? { [params.sortBy ?? "nome"]: params.order || 'asc' } : undefined,
            take: params.limit,
            skip: params.offset,
            include: params.include,
        })
    }

    async findById(id: number, include?: { cliente?: boolean; barbeiro?: boolean }): Promise<Usuario | null> {
        // Implementação da busca de usuário por ID usando Prisma
        return prisma.usuario.findUnique({
            where: { idUsuario: id },
            include: {
                cliente: include?.cliente,
                barbeiro: include?.barbeiro,
            },
        })
    }

    async create(data: CreateUsuarioAttributes): Promise<Usuario> {
        // Implementação da criação de usuário usando Prisma
        return prisma.usuario.create({ data })
    }

    async count(where: UsuarioWhereParams): Promise<number> {
        // Implementação da contagem de usuários usando Prisma
        return prisma.usuario.count({ 
            where: {
                nome: where?.nome ? { contains: where.nome.like, mode: 'insensitive' } : undefined,
                email: where?.email ? { contains: where.email.like, mode: 'insensitive' } : undefined,
                dataCriacao: where?.dataCriacao
                    ? {
                        gte: where.dataCriacao.gte,
                        lte: where.dataCriacao.lte,
                    }
                    : undefined,
                ativo: where?.ativo,
                tipoUsuario: where?.tipoUsuario
            }
        })
    }

    async updateById(id: number, data: Partial<CreateUsuarioAttributes>): Promise<Usuario | null> {
        // Implementação da atualização de usuário por ID usando Prisma
        return prisma.usuario.update({
            where: { idUsuario: id },
            data
        })
    }

    async deleteById(id: number): Promise<Usuario | null> {
        // Implementação da exclusão de usuário por ID usando Prisma
        return prisma.usuario.update({
            where: { idUsuario: id },
            data: { ativo: false }
        })
    }
}