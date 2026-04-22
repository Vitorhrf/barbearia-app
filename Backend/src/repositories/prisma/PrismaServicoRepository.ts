import { Servico } from "@prisma/client";
import { prisma } from "../../database";
import { ServicoRepository, FindServicoParams, CreateServicoAttributes, ServicoWhereParams } from "../ServicoRepository";

export class PrismaServicoRepository implements ServicoRepository {
    async find(params: FindServicoParams): Promise<Servico[]> {
        return prisma.servico.findMany({
            where: {
                idBarbearia: params?.where?.idBarbearia,
                nome: params?.where?.nome ? { contains: params.where.nome.like, mode: "insensitive" } : undefined,
                descricao: params?.where?.descricao ? { contains: params.where.descricao.like, mode: "insensitive" } : undefined,
                preco: params?.where?.preco ? { gte: params.where.preco.gte, lte: params.where.preco.lte } : undefined,
                duracaoMin: params?.where?.duracaoMin ? { gte: params.where.duracaoMin.gte, lte: params.where.duracaoMin.lte } : undefined,
            },
            orderBy: params.sortBy ? { [params.sortBy ?? "nome"]: params.order || "asc" } : undefined,
            take: params.limit,
            skip: params.offset,
        });
    }

    async findById(id: number, idBarbearia?: number): Promise<Servico | null> {
        return prisma.servico.findFirst({
            where: {
                idServico: id,
                idBarbearia,
            },
        });
    }

    async create(data: CreateServicoAttributes): Promise<Servico> {
        return prisma.servico.create({ data });
    }

    async count(where: ServicoWhereParams): Promise<number> {
        return prisma.servico.count({
            where: {
                idBarbearia: where?.idBarbearia,
                nome: where?.nome ? { contains: where.nome.like, mode: "insensitive" } : undefined,
                descricao: where?.descricao ? { contains: where.descricao.like, mode: "insensitive" } : undefined,
                preco: where?.preco ? { gte: where.preco.gte, lte: where.preco.lte } : undefined,
                duracaoMin: where?.duracaoMin ? { gte: where.duracaoMin.gte, lte: where.duracaoMin.lte } : undefined,
            },
        });
    }

    async updateById(id: number, idBarbearia: number, data: Partial<CreateServicoAttributes>): Promise<Servico | null> {
        const servico = await this.findById(id, idBarbearia);
        if (!servico) return null;

        return prisma.servico.update({
            where: { idServico: id },
            data,
        });
    }

    async deleteById(id: number, idBarbearia: number): Promise<Servico | null> {
        const servico = await this.findById(id, idBarbearia);
        if (!servico) return null;

        return prisma.servico.delete({
            where: { idServico: id },
        });
    }
}
