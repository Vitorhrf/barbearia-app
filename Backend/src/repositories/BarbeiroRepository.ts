import { Barbeiro } from "@prisma/client"

export interface CreateBarbeiroAttributes {
    idUsuario: number
    especialidade?: string
    comissao?: number
    telefone?: string
}

export interface BarbeiroWhereParams {
    especialidade?: { like?: string }
    telefone?: { like?: string }
    comissao?: { gte?: number; lte?: number }
}

export interface FindBarbeiroParams {
    where?: BarbeiroWhereParams
    sortBy?: "idBarbeiro" | "idUsuario" | "especialidade" | "comissao" | "telefone"
    order?: "asc" | "desc"
    limit?: number
    offset?: number
}

export interface BarbeiroRepository {
    find(params?: FindBarbeiroParams & {
        usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean }
        usuarioSortBy?: "nome" | "email" | "dataCriacao" | "ativo"
    }): Promise<Barbeiro[]>

    findById(id: number): Promise<Barbeiro | null>
    create(data: CreateBarbeiroAttributes): Promise<Barbeiro>
    count(where: BarbeiroWhereParams & {
        usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean }
    }): Promise<number>
    updateById(id: number, data: Partial<CreateBarbeiroAttributes>): Promise<Barbeiro | null>
    deleteById(id: number): Promise<Barbeiro | null>
}
