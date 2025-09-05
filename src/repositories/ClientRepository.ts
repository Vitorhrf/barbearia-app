import { Client } from "@prisma/client"


export interface ClientWhereParams {
    name?: {
        like?: string
        mode?: "insensitive" | "default"
    }
    phone?: {
        like?: string
        mode?: "insensitive" | "default"
    }
    cpf?: {
        equals?: number
        mode?: "insensitive" | "default"
    }
}

export interface FindClientsParams {
    where?: ClientWhereParams
    sortBy?: "name" | "createdAt" | "updatedAt"
    order?: "asc" | "desc"
    limit?: number
    offset?: number
    include?: {
        appointments?: boolean
        sales?: boolean
        user?: {
            select?: {
                email: true
            }
        }
    }
}

export interface CreateClientsAttributes {
    email: string
    password: string
    name: string
    phone: string
    address?: string
    cpf?: number
}

export interface ClientsRepository {
    find: (params: FindClientsParams) => Promise<Client[]>
    findById: (id: number) => Promise<Client | null>
    create: (data: CreateClientsAttributes) => Promise<Client>
    count: (where: ClientWhereParams) => Promise<number>
    updateById: (id: number, data: Partial<CreateClientsAttributes>) => Promise<Client | null>
    deleteById: (id: number) => Promise<Client | null>
}