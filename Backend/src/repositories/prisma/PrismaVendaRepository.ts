import { Venda, VendaProduto } from "@prisma/client"
import { prisma } from "../../database"
import {
  VendaRepository,
  CreateVendaAttributes,
  FindVendaParams,
  VendaWhereParams,
} from "../VendaRepository"

// Função auxiliar para criar o where do Prisma
function buildVendaWhere(where?: VendaWhereParams) {
  return {
    idVenda: where?.idVenda,
    idCliente: where?.idCliente,
    dataVenda: where?.dataVenda
      ? { gte: where.dataVenda.gte, lte: where.dataVenda.lte }
      : undefined,
    formaPagamento: where?.formaPagamento,
    vendaProdutos: where?.produtos
      ? {
          some: {
            idProduto: where.produtos.idProduto,
            quantidade: where.produtos.quantidade
              ? {
                  gte: where.produtos.quantidade.gte,
                  lte: where.produtos.quantidade.lte,
                }
              : undefined,
          },
        }
      : undefined,
  }
}

export class PrismaVendaRepository implements VendaRepository {
  async find(params?: FindVendaParams): Promise<Venda[]> {
    return prisma.venda.findMany({
      where: buildVendaWhere(params?.where),
      orderBy: params?.sortBy
        ? { [params.sortBy]: params.order ?? "asc" }
        : undefined,
      take: params?.limit,
      skip: params?.offset,
      include: {
        cliente: params?.include?.cliente ?? false,
        vendaProdutos: params?.include?.vendaProdutos ?? false,
      },
    })
  }

  async findById(
    id: number,
    include?: { cliente?: boolean; vendaProdutos?: boolean }
  ): Promise<Venda | null> {
    return prisma.venda.findUnique({
      where: { idVenda: id },
      include: {
        cliente: include?.cliente ?? false,
        vendaProdutos: include?.vendaProdutos ?? false,
      },
    })
  }

  async create(data: CreateVendaAttributes): Promise<Venda> {
    // Calcula valorTotal somando os produtos
    const valorTotal = data.produtos.reduce(
      (acc, item) => acc + item.precoUnit * item.quantidade,
      0
    )

    return prisma.venda.create({
      data: {
        idCliente: data.idCliente,
        formaPagamento: data.formaPagamento,
        valorTotal,
        vendaProdutos: {
          create: data.produtos.map((item) => ({
            idProduto: item.idProduto,
            quantidade: item.quantidade,
            precoUnit: item.precoUnit,
          })),
        },
      },
      include: {
        vendaProdutos: true,
      },
    })
  }

  async count(where?: VendaWhereParams): Promise<number> {
    return prisma.venda.count({
      where: buildVendaWhere(where),
    })
  }

  async updateById(
    id: number,
    data: Partial<CreateVendaAttributes>
  ): Promise<Venda | null> {
    let valorTotal: number | undefined = undefined

    if (data.produtos) {
      valorTotal = data.produtos.reduce(
        (acc, item) => acc + item.precoUnit * item.quantidade,
        0
      )
    }

    return prisma.venda.update({
      where: { idVenda: id },
      data: {
        idCliente: data.idCliente,
        formaPagamento: data.formaPagamento,
        ...(valorTotal !== undefined ? { valorTotal } : {}),
        vendaProdutos: data.produtos
          ? {
              deleteMany: {}, // remove itens antigos
              create: data.produtos.map((item) => ({
                idProduto: item.idProduto,
                quantidade: item.quantidade,
                precoUnit: item.precoUnit,
              })),
            }
          : undefined,
      },
      include: {
        vendaProdutos: true,
      },
    })
  }

  async deleteById(id: number): Promise<Venda | null> {
    return prisma.venda.delete({
      where: { idVenda: id },
    })
  }
}
