import { Servico } from "@prisma/client"

export interface CreateServicoAttributes {
    idBarbearia: number
    nome: string
    descricao?: string
    preco: number
    duracaoMin: number // duração em minutos
}

export interface ServicoWhereParams {
    idBarbearia?: number
    nome?: {
        like?: string
    }
    descricao?: {
        like?: string
    }
    preco?: {
        gte?: number
        lte?: number
    }
    duracaoMin?: {
        gte?: number
        lte?: number
    }
}
export interface FindServicoParams {
    where?: ServicoWhereParams
    sortBy?: "idBarbearia" | "nome" | "descricao" | "preco" | "duracaoMin"
    order?: "asc" | "desc"
    limit?: number
    offset?: number
}

export interface ServicoRepository {
    find: (params: FindServicoParams) => Promise<Servico[]>
    findById: (id: number, idBarbearia?: number) => Promise<Servico | null>
    create: (data: CreateServicoAttributes) => Promise<Servico>
    count: (where: ServicoWhereParams) => Promise<number>
    updateById: (id: number, idBarbearia: number, data: Partial<CreateServicoAttributes>) => Promise<Servico | null>
    deleteById: (id: number, idBarbearia: number) => Promise<Servico | null>
}
