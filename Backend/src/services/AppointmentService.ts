import { DiaSemana, StatusAgendamento } from "@prisma/client";
import { prisma } from "../database/index.js";
import { HttpError } from "../errors/HttpError.js";

interface CreateAppointmentParams {
  idBarbearia: number;
  idCliente: number;
  idBarbeiro: number;
  idServico: number;
  dataHoraInicio: Date;
  status?: "pendente" | "confirmado";
}

interface GetAvailableAppointmentsParams {
  idBarbearia: number;
  idBarbeiro: number;
  idServico: number;
  data: string;
  inicioExpediente?: string;
  fimExpediente?: string;
  intervaloMin?: number;
}

const DEFAULT_INTERVAL_MIN = 30;
const BLOCKING_STATUSES: StatusAgendamento[] = [
  StatusAgendamento.pendente,
  StatusAgendamento.confirmado,
  StatusAgendamento.concluido,
];

export class AppointmentService {
  async createAppointment(params: CreateAppointmentParams) {
    const { cliente, barbeiro, servico } = await this.validateTenantEntities(
      params.idBarbearia,
      params.idCliente,
      params.idBarbeiro,
      params.idServico,
    );
    const validatedCliente = cliente!;
    const validatedBarbeiro = barbeiro!;
    const validatedServico = servico!;
    this.ensureFutureAppointment(params.dataHoraInicio);
    this.ensureValidServiceDuration(validatedServico.duracaoMin);

    const dataHoraFim = new Date(params.dataHoraInicio.getTime() + validatedServico.duracaoMin * 60000);

    await this.ensureNoConflict(params.idBarbearia, params.idBarbeiro, params.dataHoraInicio, dataHoraFim);

    return prisma.agendamento.create({
      data: {
        idBarbearia: params.idBarbearia,
        idCliente: validatedCliente.idCliente,
        idBarbeiro: validatedBarbeiro.idBarbeiro,
        idServico: validatedServico.idServico,
        dataHoraInicio: params.dataHoraInicio,
        dataHoraFim,
        status: params.status ?? "pendente",
      },
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                idUsuario: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        barbeiro: {
          include: {
            usuario: {
              select: {
                idUsuario: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        servico: true,
      },
    });
  }

  async getAvailableAppointments(params: GetAvailableAppointmentsParams) {
    const { barbeiro, servico } = await this.validateTenantEntities(
      params.idBarbearia,
      undefined,
      params.idBarbeiro,
      params.idServico,
    );
    const validatedBarbeiro = barbeiro!;
    const validatedServico = servico!;
    this.ensureValidServiceDuration(validatedServico.duracaoMin);

    const intervaloMin = params.intervaloMin ?? DEFAULT_INTERVAL_MIN;
    const diaSemana = this.getDiaSemana(params.data);
    const schedules = await prisma.horarioTrabalhoBarbeiro.findMany({
      where: {
        idBarbearia: params.idBarbearia,
        idBarbeiro: validatedBarbeiro.idBarbeiro,
        diaSemana,
        ativo: true,
      },
      orderBy: {
        horaInicio: "asc",
      },
    });

    if (!schedules.length) {
      return {
        barbeiro: {
          idBarbeiro: validatedBarbeiro.idBarbeiro,
          nome: validatedBarbeiro.usuario.nome,
        },
        servico: {
          idServico: validatedServico.idServico,
          nome: validatedServico.nome,
          duracaoMin: validatedServico.duracaoMin,
        },
        data: params.data,
        intervaloMin,
        slots: [],
      };
    }

    const windows = schedules.map((schedule) => {
      const start = this.combineDateAndTime(params.data, schedule.horaInicio);
      const end = this.combineDateAndTime(params.data, schedule.horaFim);

      if (end <= start) {
        throw new HttpError(400, "Intervalo de jornada invalido");
      }

      return {
        inicio: schedule.horaInicio,
        fim: schedule.horaFim,
        start,
        end,
      };
    });

    const dayStart = windows[0]!.start;
    const dayEnd = windows[windows.length - 1]!.end;

    const appointments = await prisma.agendamento.findMany({
      where: {
        idBarbearia: params.idBarbearia,
        idBarbeiro: validatedBarbeiro.idBarbeiro,
        status: { in: BLOCKING_STATUSES },
        dataHoraInicio: {
          lt: dayEnd,
        },
        dataHoraFim: {
          gt: dayStart,
        },
      },
      orderBy: {
        dataHoraInicio: "asc",
      },
    });

    const blocks = await prisma.bloqueioAgenda.findMany({
      where: {
        idBarbearia: params.idBarbearia,
        OR: [
          { idBarbeiro: validatedBarbeiro.idBarbeiro },
          { idBarbeiro: null },
        ],
        dataHoraInicio: {
          lt: dayEnd,
        },
        dataHoraFim: {
          gt: dayStart,
        },
      },
      orderBy: {
        dataHoraInicio: "asc",
      },
    });

    const slots: Array<{
      dataHoraInicio: string;
      dataHoraFim: string;
      disponivel: boolean;
    }> = [];

    for (const window of windows) {
      for (
        let cursor = new Date(window.start);
        cursor < window.end;
        cursor = new Date(cursor.getTime() + intervaloMin * 60000)
      ) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(slotStart.getTime() + validatedServico.duracaoMin * 60000);

        if (slotEnd > window.end) {
          break;
        }

        const hasBlockConflict = blocks.some(
          (block) => block.dataHoraInicio < slotEnd && block.dataHoraFim > slotStart,
        );

        const hasAppointmentConflict = appointments.some(
          (appointment) => appointment.dataHoraInicio < slotEnd && appointment.dataHoraFim > slotStart,
        );

        slots.push({
          dataHoraInicio: slotStart.toISOString(),
          dataHoraFim: slotEnd.toISOString(),
          disponivel: !hasBlockConflict && !hasAppointmentConflict,
        });
      }
    }

    return {
      barbeiro: {
        idBarbeiro: validatedBarbeiro.idBarbeiro,
        nome: validatedBarbeiro.usuario.nome,
      },
      servico: {
        idServico: validatedServico.idServico,
        nome: validatedServico.nome,
        duracaoMin: validatedServico.duracaoMin,
      },
      data: params.data,
      jornadas: windows.map((window) => ({
        horaInicio: window.inicio,
        horaFim: window.fim,
      })),
      intervaloMin,
      slots,
    };
  }

  private async validateTenantEntities(
    idBarbearia: number,
    idCliente?: number,
    idBarbeiro?: number,
    idServico?: number,
  ) {
    const [cliente, barbeiro, servico] = await Promise.all([
      typeof idCliente === "number"
        ? prisma.cliente.findFirst({
            where: {
              idCliente,
              idBarbearia,
            },
          })
        : Promise.resolve(null),
      typeof idBarbeiro === "number"
        ? prisma.barbeiro.findFirst({
            where: {
              idBarbeiro,
              idBarbearia,
            },
            include: {
              usuario: {
                select: {
                  nome: true,
                },
              },
            },
          })
        : Promise.resolve(null),
      typeof idServico === "number"
        ? prisma.servico.findFirst({
            where: {
              idServico,
              idBarbearia,
            },
          })
        : Promise.resolve(null),
    ]);

    if (typeof idCliente === "number" && !cliente) {
      throw new HttpError(404, "Cliente nao encontrado para a barbearia ativa");
    }

    if (typeof idBarbeiro === "number" && !barbeiro) {
      throw new HttpError(404, "Barbeiro nao encontrado para a barbearia ativa");
    }

    if (typeof idServico === "number" && !servico) {
      throw new HttpError(404, "Servico nao encontrado para a barbearia ativa");
    }

    return {
      cliente,
      barbeiro,
      servico,
    };
  }

  private async ensureNoConflict(
    idBarbearia: number,
    idBarbeiro: number,
    dataHoraInicio: Date,
    dataHoraFim: Date,
  ) {
    const conflict = await prisma.agendamento.findFirst({
      where: {
        idBarbearia,
        idBarbeiro,
        status: { in: BLOCKING_STATUSES },
        dataHoraInicio: {
          lt: dataHoraFim,
        },
        dataHoraFim: {
          gt: dataHoraInicio,
        },
      },
    });

    if (conflict) {
      throw new HttpError(409, "Ja existe um agendamento conflitante para este barbeiro");
    }
  }

  private combineDateAndTime(date: string, time: string) {
    const iso = `${date}T${time}:00`;
    const result = new Date(iso);

    if (Number.isNaN(result.getTime())) {
      throw new HttpError(400, "Data ou horario invalido");
    }

    return result;
  }

  private getDiaSemana(date: string): DiaSemana {
    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      throw new HttpError(400, "Data invalida");
    }

    const map: DiaSemana[] = [
      DiaSemana.domingo,
      DiaSemana.segunda,
      DiaSemana.terca,
      DiaSemana.quarta,
      DiaSemana.quinta,
      DiaSemana.sexta,
      DiaSemana.sabado,
    ];

    return map[parsed.getDay()]!;
  }

  private ensureFutureAppointment(dataHoraInicio: Date) {
    if (dataHoraInicio.getTime() < Date.now()) {
      throw new HttpError(400, "Nao e permitido criar agendamento no passado");
    }
  }

  private ensureValidServiceDuration(duracaoMin: number) {
    if (!Number.isFinite(duracaoMin) || duracaoMin <= 0) {
      throw new HttpError(400, "Servico com duracao invalida");
    }
  }
}
