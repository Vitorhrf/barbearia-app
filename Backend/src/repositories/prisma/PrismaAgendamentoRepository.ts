import { Agendamento } from "@prisma/client"
import { prisma } from "../../database"
import { AgendamentoRepository, CreateAgendamentoAttributes, FindAgendamentoParams, AgendamentoWhereParams } from "../AgendamentoRepository"
export class PrismaAgendamentoRepository implements AgendamentoRepository {
    async find(params: FindAgendamentoParams): Promise<Agendamento[]> {
        // Implementação da busca de agendamentos usando Prisma
        return prisma.agendamento.findMany({
            where: {
                idCliente: params?.where?.idCliente,
                idBarbeiro: params?.where?.idBarbeiro,
                idServico: params?.where?.idServico,
                dataHoraInicio: params?.where?.dataHoraInicio ? {
                    gte: params.where.dataHoraInicio.gte,   
                    lte: params.where.dataHoraInicio.lte
                } : undefined,
                dataHoraFim: params?.where?.dataHoraFim ? {
                    gte: params.where.dataHoraFim.gte,
                    lte: params.where.dataHoraFim.lte
                } : undefined,
                status: params?.where?.status
            },
            orderBy: params.sortBy ? { [params.sortBy]: params.order || 'asc' } : undefined,
            take: params.limit,
            skip: params.offset,
            include: {
                cliente: params.include?.cliente,
                barbeiro: params.include?.barbeiro,
                servico: params.include?.servico
            }
        })
    }
    async findById(id: number, include?: { cliente?: boolean; barbeiro?: boolean; servico?: boolean }): Promise<Agendamento | null> {
        // Implementação da busca de agendamento por ID usando Prisma
        return prisma.agendamento.findUnique({
            where: { idAgendamento: id },
            include: {
                cliente: include?.cliente,
                barbeiro: include?.barbeiro,
                servico: include?.servico
            }
        })
    }
    async create(data: CreateAgendamentoAttributes): Promise<Agendamento> {
        // Pega o serviço para calcular a duração
        const servico = await prisma.servico.findUnique({ where: { idServico: data.idServico } })
        if (!servico) throw new Error("Serviço não encontrado")

        const duracaoMin = Number(servico.duracaoMin) // Converte Decimal para number
        const dataHoraFim = new Date(data.dataHoraInicio.getTime() + duracaoMin * 60000)

        return prisma.agendamento.create({
            data: {
                ...data,
                dataHoraFim
            }
        })
    }
    async count(where: AgendamentoWhereParams): Promise<number> {
        // Implementação da contagem de agendamentos usando Prisma
        return prisma.agendamento.count({
            where: {
                idCliente: where?.idCliente,
                idBarbeiro: where?.idBarbeiro,
                idServico: where?.idServico,
                dataHoraInicio: where?.dataHoraInicio ? {
                    gte: where.dataHoraInicio.gte,
                    lte: where.dataHoraInicio.lte
                } : undefined,
                dataHoraFim: where?.dataHoraFim ? {
                    gte: where.dataHoraFim.gte,
                    lte: where.dataHoraFim.lte
                } : undefined,
                status: where?.status
            }
        })
    }
    async updateById(id: number, data: Partial<CreateAgendamentoAttributes>): Promise<Agendamento | null> {
        const agendamentoAtual = await prisma.agendamento.findUnique({ where: { idAgendamento: id } })
        if (!agendamentoAtual) throw new Error("Agendamento não encontrado")

        let dataHoraFim: Date | undefined = undefined

        // Verifica se precisa recalcular a dataHoraFim
        if (data.idServico || data.dataHoraInicio) {
            const servico = await prisma.servico.findUnique({
                where: { idServico: data.idServico || agendamentoAtual.idServico }
            })
            if (!servico) throw new Error("Serviço não encontrado")

            const duracaoMin = Number(servico.duracaoMin)
            const dataInicio = data.dataHoraInicio || agendamentoAtual.dataHoraInicio
            dataHoraFim = new Date(dataInicio.getTime() + duracaoMin * 60000)
        }

        return prisma.agendamento.update({
            where: { idAgendamento: id },
            data: {
                ...data,
                ...(dataHoraFim ? { dataHoraFim } : {})
            }
        })
    }
    async deleteById(id: number): Promise<Agendamento | null> {
        return prisma.agendamento.delete({
            where: { idAgendamento: id }
        })
    }
}