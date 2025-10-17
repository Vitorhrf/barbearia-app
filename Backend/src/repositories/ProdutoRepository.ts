import { Produto } from "@prisma/client"

export interface CreateProdutoAttributes {
    nome: string
    categoria?: string
    preco: number
    quantidade: number
}

export interface ProdutoWhereParams {
    nome?: {
        like?: string
    }
    categoria?: {
        like?: string
    }
    preco?: {
        gte?: number
        lte?: number
    }
    quantidade?: {
        gte?: number
        lte?: number
    }
    dataCadastro?: {
        gte?: Date
        lte?: Date
    }
}

export interface FindProdutoParams {
    where?: ProdutoWhereParams
    sortBy?: "nome" | "categoria" | "preco" | "quantidade" | "dataCadastro"
    order?: "asc" | "desc"
    limit?: number
    offset?: number
}

export interface ProdutoRepository {
    find: (params: FindProdutoParams) => Promise<Produto[]>
    findById: (id: number) => Promise<Produto | null>
    create: (data: CreateProdutoAttributes) => Promise<Produto>
    count: (where: ProdutoWhereParams) => Promise<number>
    updateById: (id: number, data: Partial<CreateProdutoAttributes>) => Promise<Produto | null>
    deleteById: (id: number) => Promise<Produto | null>
}