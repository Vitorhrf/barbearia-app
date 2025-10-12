import { Usuario } from "@prisma/client"


export interface CreateUsuarioAttributes {
    nome: string
    email: string
    senhaHash: string
    tipoUsuario: "admin" | "cliente" | "barbeiro"
}

export interface UsuarioWhereParams {
    nome?: {
        like?: string
    }
    email?: {
        like?: string
    }
    dataCriacao?: {
        gte?: Date
        lte?: Date
    }
    tipoUsuario?: "admin" | "cliente" | "barbeiro"
    ativo?: boolean
}

export interface FindUsuarioParams {
    where?: UsuarioWhereParams
    sortBy?: "nome" | "email" | "dataCriacao" | "tipoUsuario" | "ativo"
    order?: "asc" | "desc"
    limit?: number
    offset?: number
    include?: {
        cliente?: boolean
        barbeiro?: boolean
    }
}

export interface UsuarioRepository {
    find: (params: FindUsuarioParams) => Promise<Usuario[]>
    findById: (id: number, include?: { cliente?: boolean; barbeiro?: boolean }) => Promise<Usuario | null>
    create: (data: CreateUsuarioAttributes) => Promise<Usuario>
    count: (where: UsuarioWhereParams) => Promise<number>
    updateById: (id: number, data: Partial<CreateUsuarioAttributes>) => Promise<Usuario | null>
    deleteById: (id: number) => Promise<Usuario | null>
}