import { DiaSemana } from "@prisma/client";
import { prisma } from "../database/index.js";
import { HttpError } from "../errors/HttpError.js";

interface CreateWorkScheduleParams {
  idBarbearia: number;
  idBarbeiro: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
}

interface UpdateWorkScheduleParams {
  idBarbearia: number;
  idBarbeiro: number;
  idHorarioTrabalho: number;
  diaSemana?: DiaSemana;
  horaInicio?: string;
  horaFim?: string;
  ativo?: boolean;
}

export class BarberWorkScheduleService {
  async list(idBarbearia: number, idBarbeiro: number) {
    await this.ensureBarberBelongsToTenant(idBarbearia, idBarbeiro);

    return prisma.horarioTrabalhoBarbeiro.findMany({
      where: {
        idBarbearia,
        idBarbeiro,
      },
      orderBy: [
        { diaSemana: "asc" },
        { horaInicio: "asc" },
      ],
    });
  }

  async create(data: CreateWorkScheduleParams) {
    await this.ensureBarberBelongsToTenant(data.idBarbearia, data.idBarbeiro);
    this.ensureValidTimeRange(data.horaInicio, data.horaFim);
    await this.ensureNoScheduleConflict(
      data.idBarbearia,
      data.idBarbeiro,
      data.diaSemana,
      data.horaInicio,
      data.horaFim,
    );

    return prisma.horarioTrabalhoBarbeiro.create({
      data,
    });
  }

  async update(data: UpdateWorkScheduleParams) {
    const schedule = await prisma.horarioTrabalhoBarbeiro.findFirst({
      where: {
        idHorarioTrabalho: data.idHorarioTrabalho,
        idBarbearia: data.idBarbearia,
        idBarbeiro: data.idBarbeiro,
      },
    });

    if (!schedule) {
      throw new HttpError(404, "Horario de trabalho nao encontrado");
    }

    this.ensureValidTimeRange(data.horaInicio ?? schedule.horaInicio, data.horaFim ?? schedule.horaFim);
    await this.ensureNoScheduleConflict(
      data.idBarbearia,
      data.idBarbeiro,
      data.diaSemana ?? schedule.diaSemana,
      data.horaInicio ?? schedule.horaInicio,
      data.horaFim ?? schedule.horaFim,
      schedule.idHorarioTrabalho,
    );

    return prisma.horarioTrabalhoBarbeiro.update({
      where: { idHorarioTrabalho: schedule.idHorarioTrabalho },
      data: {
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio,
        horaFim: data.horaFim,
        ativo: data.ativo,
      },
    });
  }

  async delete(idBarbearia: number, idBarbeiro: number, idHorarioTrabalho: number) {
    const schedule = await prisma.horarioTrabalhoBarbeiro.findFirst({
      where: {
        idHorarioTrabalho,
        idBarbearia,
        idBarbeiro,
      },
    });

    if (!schedule) {
      throw new HttpError(404, "Horario de trabalho nao encontrado");
    }

    await prisma.horarioTrabalhoBarbeiro.delete({
      where: {
        idHorarioTrabalho: schedule.idHorarioTrabalho,
      },
    });
  }

  private async ensureBarberBelongsToTenant(idBarbearia: number, idBarbeiro: number) {
    const barber = await prisma.barbeiro.findFirst({
      where: {
        idBarbearia,
        idBarbeiro,
      },
    });

    if (!barber) {
      throw new HttpError(404, "Barbeiro nao encontrado para a barbearia ativa");
    }
  }

  private ensureValidTimeRange(horaInicio: string, horaFim: string) {
    if (horaInicio >= horaFim) {
      throw new HttpError(400, "Intervalo de jornada invalido");
    }
  }

  private async ensureNoScheduleConflict(
    idBarbearia: number,
    idBarbeiro: number,
    diaSemana: DiaSemana,
    horaInicio: string,
    horaFim: string,
    ignoreId?: number,
  ) {
    const conflict = await prisma.horarioTrabalhoBarbeiro.findFirst({
      where: {
        idBarbearia,
        idBarbeiro,
        diaSemana,
        ativo: true,
        idHorarioTrabalho: ignoreId ? { not: ignoreId } : undefined,
        horaInicio: {
          lt: horaFim,
        },
        horaFim: {
          gt: horaInicio,
        },
      },
    });

    if (conflict) {
      throw new HttpError(409, "Ja existe um horario de trabalho sobreposto para este barbeiro");
    }
  }
}
