import { Servico } from "@prisma/client";
import { prisma } from "../../database";
import { ServicoRepository, FindServicoParams, CreateServicoAttributes, ServicoWhereParams } from "../ServicoRepository";


export class PrismaServicoRepository implements ServicoRepository {
    async find(params: FindServicoParams): Promise<Servico[]> {
        // Implementação da busca de serviços usando Prisma 
        return prisma.servico.findMany({
            where: {
                nome: params?.where?.nome ? { contains: params.where.nome.like, mode: 'insensitive' } : undefined,
                descricao: params?.where?.descricao ? { contains: params.where.descricao.like, mode: 'insensitive' } : undefined,
                preco: params?.where?.preco ? { gte: params.where.preco.gte, lte: params.where.preco.lte } : undefined,
                duracaoMin: params?.where?.duracaoMin ? { gte: params.where.duracaoMin.gte, lte: params.where.duracaoMin.lte } : undefined
            },
            orderBy: params.sortBy ? { [params.sortBy ?? "nome"]: params.order || 'asc' } : undefined,
            take: params.limit,
            skip: params.offset
        })
    }
    async findById(id: number): Promise<Servico | null> {
        // Implementação da busca de serviço por ID usando Prisma
        return prisma.servico.findUnique({
            where: { idServico: id }
        })
    }
    async create(data: CreateServicoAttributes): Promise<Servico> {
        // Implementação da criação de serviço usando Prisma
        return prisma.servico.create({ data })
    }
    async count(where: ServicoWhereParams): Promise<number> {
        // Implementação da contagem de serviços usando Prisma
        return prisma.servico.count({
            where: {
                nome: where?.nome ? { contains: where.nome.like, mode: 'insensitive' } : undefined,
                descricao: where?.descricao ? { contains: where.descricao.like, mode: 'insensitive' } : undefined,
                preco: where?.preco ? { gte: where.preco.gte, lte: where.preco.lte } : undefined,
                duracaoMin: where?.duracaoMin ? { gte: where.duracaoMin.gte, lte: where.duracaoMin.lte } : undefined
            }
        })
    }   
    async updateById(id: number, data: Partial<CreateServicoAttributes>): Promise<Servico | null> {
        // Implementação da atualização de serviço por ID usando Prisma
        return prisma.servico.update({
            where: { idServico: id },
            data
        })
    }
    async deleteById(id: number): Promise<Servico | null> {
        // Implementação da exclusão de serviço por ID usando Prisma
        return prisma.servico.delete({
            where: { idServico: id }
        })
    }
}