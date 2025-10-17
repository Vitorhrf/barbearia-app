import { Venda, Produto } from "@prisma/client"

// Atributos para criar uma venda
export interface CreateVendaAttributes {
  idCliente?: number
  formaPagamento: "dinheiro" | "pix" | "cartao"
  produtos: {
    idProduto: number
    quantidade: number
    precoUnit: number
  }[]
}

// Filtros de busca
export interface VendaWhereParams {
  idVenda?: number
  idCliente?: number
  dataVenda?: {
    gte?: Date
    lte?: Date
  }
  formaPagamento?: "dinheiro" | "pix" | "cartao"
  produtos?: { idProduto?: number; quantidade?: { gte?: number; lte?: number } } // filtro por VendaProduto
}

// Parâmetros para buscar vendas
export interface FindVendaParams {
  where?: VendaWhereParams
  sortBy?: "idVenda" | "idCliente" | "dataVenda" | "valorTotal" | "formaPagamento"
  order?: "asc" | "desc"
  limit?: number
  offset?: number
  include?: {
    cliente?: boolean
    vendaProdutos?: boolean // inclui os produtos da venda
  }
}

// Interface do repository
export interface VendaRepository {
  find(params?: FindVendaParams): Promise<Venda[]>
  findById(id: number, include?: { cliente?: boolean; vendaProdutos?: boolean }): Promise<Venda | null>
  create(data: CreateVendaAttributes): Promise<Venda>
  count(where?: VendaWhereParams): Promise<number>
  updateById(id: number, data: Partial<CreateVendaAttributes>): Promise<Venda | null>
  deleteById(id: number): Promise<Venda | null>
}
