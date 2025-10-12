import { Cliente } from "@prisma/client"


export interface CreateClienteAttributes {
    idUsuario: number
    telefone?: string
    dataNascimento?: Date
    observacoes?: string
}

export interface ClienteWhereParams {
    telefone?: {
        like?: string
    }
    dataNascimento?: {
        gte?: Date
        lte?: Date
    }
    observacoes?: {
        like?: string
    }
}

export interface FindClienteParams {
  where?: ClienteWhereParams
  sortBy?: "idCliente" | "idUsuario" | "telefone" | "dataNascimento" | "observacoes"
  order?: "asc" | "desc"
  limit?: number
  offset?: number
}

export interface ClienteRepository {
    find(params?: FindClienteParams & { usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean }, usuarioSortBy?: "nome" | "email" | "dataCriacao" | "ativo" }): Promise<Cliente[]>
    findById(id: number): Promise<Cliente | null>
    create(data: CreateClienteAttributes): Promise<Cliente>
    count(where: ClienteWhereParams & { usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean } }): Promise<number>
    updateById(id: number, data: Partial<CreateClienteAttributes>): Promise<Cliente | null>
    deleteById(id: number): Promise<Cliente | null>
}