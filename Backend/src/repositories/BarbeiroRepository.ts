import { Prisma } from "@prisma/client"

export interface CreateBarbeiroAttributes {
    idUsuario: number
    idBarbearia: number
    especialidade?: string
    comissao?: number
    telefone?: string
}

export interface BarbeiroWhereParams {
    idBarbearia?: number
    especialidade?: { like?: string }
    telefone?: { like?: string }
    comissao?: { gte?: number; lte?: number }
}

export interface FindBarbeiroParams {
    where?: BarbeiroWhereParams
    sortBy?: "idBarbeiro" | "idUsuario" | "idBarbearia" | "especialidade" | "comissao" | "telefone"
    order?: "asc" | "desc"
    limit?: number
    offset?: number
}

export type BarbeiroWithUsuario = Prisma.BarbeiroGetPayload<{
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

export interface BarbeiroRepository {
    find(params?: FindBarbeiroParams & {
        usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean }
        usuarioSortBy?: "nome" | "email" | "dataCriacao" | "ativo"
    }): Promise<BarbeiroWithUsuario[]>

    findById(id: number, idBarbearia?: number): Promise<BarbeiroWithUsuario | null>
    create(data: CreateBarbeiroAttributes): Promise<BarbeiroWithUsuario>
    count(where: BarbeiroWhereParams & {
        usuarioWhere?: { nome?: string; email?: string; dataCriacao?: { gte?: Date; lte?: Date }; ativo?: boolean }
    }): Promise<number>
    updateById(id: number, idBarbearia: number, data: Partial<CreateBarbeiroAttributes>): Promise<BarbeiroWithUsuario | null>
    deleteById(id: number, idBarbearia: number): Promise<BarbeiroWithUsuario | null>
}
