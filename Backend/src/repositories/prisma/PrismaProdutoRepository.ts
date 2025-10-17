import { Produto } from "@prisma/client";
import { prisma } from "../../database";
import { ProdutoRepository, FindProdutoParams, CreateProdutoAttributes, ProdutoWhereParams } from "../ProdutoRepository";

function buildProdutoWhere(where: ProdutoWhereParams) {
  return {
    nome: where?.nome?.like ? { contains: where.nome.like, mode: 'insensitive' as const } : undefined,
    categoria: where?.categoria?.like ? { contains: where.categoria.like, mode: 'insensitive' as const } : undefined,
    preco: where?.preco
      ? {
          gte: where.preco.gte !== undefined ? where.preco.gte : undefined,
          lte: where.preco.lte !== undefined ? where.preco.lte : undefined,
        }
      : undefined,
    quantidade: where?.quantidade
      ? {
          gte: where.quantidade.gte !== undefined ? where.quantidade.gte : undefined,
          lte: where.quantidade.lte !== undefined ? where.quantidade.lte : undefined,
        }
      : undefined,
    dataCadastro: where?.dataCadastro
      ? {
          gte: where.dataCadastro.gte ? where.dataCadastro.gte : undefined,
          lte: where.dataCadastro.lte ? where.dataCadastro.lte : undefined,
        }
      : undefined,
  }
}

export class PrismaProdutoRepository implements ProdutoRepository {
    async find(params: FindProdutoParams): Promise<Produto[]> {
        return prisma.produto.findMany({
            where: buildProdutoWhere({ ...params?.where }),
            orderBy: {
                [params?.sortBy ?? "dataCadastro"]: params?.order ?? "asc",
            },
            take: params?.limit,
            skip: params?.offset,
        })
    }
    async findById(id: number): Promise<Produto | null> {
        return prisma.produto.findUnique({
            where: { idProduto: id }
        })
    }
    async create(data: CreateProdutoAttributes): Promise<Produto> {
        return prisma.produto.create({ data })
    }
    async count(where: ProdutoWhereParams): Promise<number> {
        return prisma.produto.count({
            where: buildProdutoWhere(where)
            
        })
    }
    async updateById(id: number, data: Partial<CreateProdutoAttributes>): Promise<Produto | null> {
        return prisma.produto.update({
            where: { idProduto: id },
            data
        })
    }
    async deleteById(id: number): Promise<Produto | null> {
        return prisma.produto.delete({
            where: { idProduto: id }
        })
    }
}