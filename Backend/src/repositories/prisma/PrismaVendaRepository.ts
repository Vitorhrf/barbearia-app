import { Venda, Prisma } from "@prisma/client"
import { prisma } from "../../database"
import { VendaRepository, CreateVendaAttributes, FindVendaParams, VendaWhereParams } from "../VendaRepository"

export class PrismaVendaRepository implements VendaRepository {

  async find(params?: FindVendaParams): Promise<Venda[]> {
    return prisma.venda.findMany({
      where: {
        idCliente: params?.where?.idCliente,
        idVenda: params?.where?.idVenda,
        dataVenda: params?.where?.dataVenda
          ? {
              gte: params.where.dataVenda.gte,
              lte: params.where.dataVenda.lte
            }
          : undefined,
        formaPagamento: params?.where?.formaPagamento
      },
      orderBy: params?.sortBy ? { [params.sortBy]: params.order || "asc" } : undefined,
      take: params?.limit,
      skip: params?.offset,
      include: {
        cliente: params?.include?.cliente,
        vendaProdutos: params?.include?.vendaProdutos ? { include: { produto: true } } : false
      }
    })
  }

  async findById(id: number, include?: { cliente?: boolean; vendaProdutos?: boolean }): Promise<Venda | null> {
    return prisma.venda.findUnique({
      where: { idVenda: id },
      include: {
        cliente: include?.cliente,
        vendaProdutos: include?.vendaProdutos ? { include: { produto: true } } : false
      }
    })
  }

  async create(data: CreateVendaAttributes): Promise<Venda> {
    const valorTotal = new Prisma.Decimal(
      data.produtos.reduce((sum, item) => sum + item.precoUnit * item.quantidade, 0)
    )

    return prisma.$transaction(async (tx) => {
      const novaVenda = await tx.venda.create({
        data: {
          idCliente: data.idCliente,
          valorTotal,
          formaPagamento: data.formaPagamento
        }
      })

      const vendaProdutosData = data.produtos.map(item => ({
        idVenda: novaVenda.idVenda,
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        precoUnit: new Prisma.Decimal(item.precoUnit)
      }))

      await tx.vendaProduto.createMany({ data: vendaProdutosData })

      return novaVenda
    })
  }

  async count(where?: VendaWhereParams): Promise<number> {
    return prisma.venda.count({
      where: {
        idCliente: where?.idCliente,
        idVenda: where?.idVenda,
        dataVenda: where?.dataVenda
          ? {
              gte: where.dataVenda.gte,
              lte: where.dataVenda.lte
            }
          : undefined,
        formaPagamento: where?.formaPagamento
      }
    })
  }

  async updateById(id: number, data: Partial<CreateVendaAttributes>): Promise<Venda | null> {
    return prisma.$transaction(async (tx) => {
      const vendaAtual = await tx.venda.findUnique({
        where: { idVenda: id },
        include: { vendaProdutos: true }
      })
      if (!vendaAtual) throw new Error("Venda não encontrada")

      let novoValorTotal = vendaAtual.valorTotal

      if (data.produtos) {
        await tx.vendaProduto.deleteMany({ where: { idVenda: id } })

        const vendaProdutosData = data.produtos.map(item => ({
          idVenda: id,
          idProduto: item.idProduto,
          quantidade: item.quantidade,
          precoUnit: new Prisma.Decimal(item.precoUnit)
        }))

        await tx.vendaProduto.createMany({ data: vendaProdutosData })

        novoValorTotal = new Prisma.Decimal(
          data.produtos.reduce((sum, item) => sum + item.precoUnit * item.quantidade, 0)
        )
      }

      const vendaAtualizada = await tx.venda.update({
        where: { idVenda: id },
        data: {
          idCliente: data.idCliente ?? vendaAtual.idCliente,
          formaPagamento: data.formaPagamento ?? vendaAtual.formaPagamento,
          valorTotal: novoValorTotal
        }
      })

      return vendaAtualizada
    })
  }

  async deleteById(id: number): Promise<Venda | null> {
    return prisma.$transaction(async (tx) => {
      await tx.vendaProduto.deleteMany({ where: { idVenda: id } })
      return tx.venda.delete({ where: { idVenda: id } })
    })
  }
}
