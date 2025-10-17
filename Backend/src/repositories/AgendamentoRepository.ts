import { Agendamento } from "@prisma/client"

export interface CreateAgendamentoAttributes {
    idCliente: number
    idBarbeiro: number
    idServico: number
    dataHoraInicio: Date
    status?: "pendente" | "confirmado" | "cancelado" | "concluido"
}

export interface AgendamentoWhereParams {
    idCliente?: number
    idBarbeiro?: number
    idServico?: number
    dataHoraInicio?: {
        gte?: Date
        lte?: Date
    }
    dataHoraFim?: {
        gte?: Date
        lte?: Date
    }
    status?: "pendente" | "confirmado" | "cancelado" | "concluido"
}

export interface FindAgendamentoParams {
    where?: AgendamentoWhereParams
    sortBy?: "dataHoraInicio" | "dataHoraFim" | "status" | "idCliente" | "idBarbeiro" | "idServico"
    order?: "asc" | "desc"
    limit?: number
    offset?: number
    include?: {
        cliente?: boolean
        barbeiro?: boolean
        servico?: boolean
    }
}

export interface AgendamentoRepository {
    find: (params: FindAgendamentoParams) => Promise<Agendamento[]>
    findById: (id: number, include?: { cliente?: boolean; barbeiro?: boolean; servico?: boolean }) => Promise<Agendamento | null>
    create: (data: CreateAgendamentoAttributes) => Promise<Agendamento>
    count: (where: AgendamentoWhereParams) => Promise<number>
    updateById: (id: number, data: Partial<CreateAgendamentoAttributes>) => Promise<Agendamento | null>
    deleteById: (id: number) => Promise<Agendamento | null>
}