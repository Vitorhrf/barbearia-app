import { Prisma } from "@prisma/client"


export interface CreateClienteAttributes {
    idUsuario: number
    idBarbearia: number
    telefone?: string
    dataNascimento?: Date
    observacoes?: string
}

export interface ClienteWhereParams {
    idBarbearia?: number
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
  sortBy?: "idCliente" | "idUsuario" | "idBarbearia" | "telefone" | "dataNascimento" | "observacoes"
  order?: "asc" | "desc"
  limit?: number
  offset?: number
}

export type ClienteWithUsuario = Prisma.ClienteGetPayload<{
    include: {
        usuario: {
            select: {
                idUsuario: true
                nome: true
                email: true
                tipoUsuario: true
                ativo: true
                dataCriacao: true
            }
        }
    }
}>

export interface ClienteRepository {
    find(params?: FindClienteParams & { usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean }, usuarioSortBy?: "nome" | "email" | "dataCriacao" | "ativo" }): Promise<ClienteWithUsuario[]>
    findById(id: number, idBarbearia?: number): Promise<ClienteWithUsuario | null>
    create(data: CreateClienteAttributes): Promise<ClienteWithUsuario>
    count(where: ClienteWhereParams & { usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean } }): Promise<number>
    updateById(id: number, idBarbearia: number, data: Partial<CreateClienteAttributes>): Promise<ClienteWithUsuario | null>
    deleteById(id: number, idBarbearia: number): Promise<ClienteWithUsuario | null>
}
