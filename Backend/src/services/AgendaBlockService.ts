import { TipoBloqueioAgenda } from "@prisma/client";
import { prisma } from "../database/index.js";
import { HttpError } from "../errors/HttpError.js";

interface CreateAgendaBlockParams {
  idBarbearia: number;
  idBarbeiro?: number;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  motivo?: string;
  tipoBloqueio: TipoBloqueioAgenda;
}

interface UpdateAgendaBlockParams {
  idBarbearia: number;
  idBloqueioAgenda: number;
  idBarbeiro?: number | null;
  dataHoraInicio?: Date;
  dataHoraFim?: Date;
  motivo?: string;
  tipoBloqueio?: TipoBloqueioAgenda;
}

export class AgendaBlockService {
  async list(idBarbearia: number, idBarbeiro?: number) {
    return prisma.bloqueioAgenda.findMany({
      where: {
        idBarbearia,
        idBarbeiro,
      },
      orderBy: {
        dataHoraInicio: "asc",
      },
    });
  }

  async create(data: CreateAgendaBlockParams) {
    this.ensureValidDateRange(data.dataHoraInicio, data.dataHoraFim);

    if (data.tipoBloqueio === "barbeiro") {
      if (!data.idBarbeiro) {
        throw new HttpError(400, "Bloqueio de barbeiro exige idBarbeiro");
      }

      await this.ensureBarberBelongsToTenant(data.idBarbearia, data.idBarbeiro);
    }

    if (data.tipoBloqueio === "geral" && data.idBarbeiro) {
      throw new HttpError(400, "Bloqueio geral nao deve informar idBarbeiro");
    }

    await this.ensureNoBlockConflict(
      data.idBarbearia,
      data.tipoBloqueio,
      data.dataHoraInicio,
      data.dataHoraFim,
      data.idBarbeiro,
    );

    return prisma.bloqueioAgenda.create({
      data: {
        idBarbearia: data.idBarbearia,
        idBarbeiro: data.idBarbeiro,
        dataHoraInicio: data.dataHoraInicio,
        dataHoraFim: data.dataHoraFim,
        motivo: data.motivo,
        tipoBloqueio: data.tipoBloqueio,
      },
    });
  }

  async update(data: UpdateAgendaBlockParams) {
    const block = await prisma.bloqueioAgenda.findFirst({
      where: {
        idBloqueioAgenda: data.idBloqueioAgenda,
        idBarbearia: data.idBarbearia,
      },
    });

    if (!block) {
      throw new HttpError(404, "Bloqueio de agenda nao encontrado");
    }

    const nextTipo = data.tipoBloqueio ?? block.tipoBloqueio;
    const nextBarberId = data.idBarbeiro !== undefined ? data.idBarbeiro ?? undefined : block.idBarbeiro ?? undefined;
    const nextStart = data.dataHoraInicio ?? block.dataHoraInicio;
    const nextEnd = data.dataHoraFim ?? block.dataHoraFim;

    this.ensureValidDateRange(nextStart, nextEnd);

    if (nextTipo === "barbeiro") {
      if (!nextBarberId) {
        throw new HttpError(400, "Bloqueio de barbeiro exige idBarbeiro");
      }

      await this.ensureBarberBelongsToTenant(data.idBarbearia, nextBarberId);
    }

    if (nextTipo === "geral" && nextBarberId) {
      throw new HttpError(400, "Bloqueio geral nao deve informar idBarbeiro");
    }

    await this.ensureNoBlockConflict(
      data.idBarbearia,
      nextTipo,
      nextStart,
      nextEnd,
      nextBarberId,
      block.idBloqueioAgenda,
    );

    return prisma.bloqueioAgenda.update({
      where: {
        idBloqueioAgenda: block.idBloqueioAgenda,
      },
      data: {
        idBarbeiro: nextTipo === "geral" ? null : nextBarberId,
        dataHoraInicio: nextStart,
        dataHoraFim: nextEnd,
        motivo: data.motivo,
        tipoBloqueio: nextTipo,
      },
    });
  }

  async delete(idBarbearia: number, idBloqueioAgenda: number) {
    const block = await prisma.bloqueioAgenda.findFirst({
      where: {
        idBloqueioAgenda,
        idBarbearia,
      },
    });

    if (!block) {
      throw new HttpError(404, "Bloqueio de agenda nao encontrado");
    }

    await prisma.bloqueioAgenda.delete({
      where: {
        idBloqueioAgenda: block.idBloqueioAgenda,
      },
    });
  }

  private ensureValidDateRange(dataHoraInicio: Date, dataHoraFim: Date) {
    if (dataHoraFim <= dataHoraInicio) {
      throw new HttpError(400, "Intervalo de bloqueio invalido");
    }
  }

  private async ensureNoBlockConflict(
    idBarbearia: number,
    tipoBloqueio: TipoBloqueioAgenda,
    dataHoraInicio: Date,
    dataHoraFim: Date,
    idBarbeiro?: number,
    ignoreId?: number,
  ) {
    const conflict = await prisma.bloqueioAgenda.findFirst({
      where: {
        idBarbearia,
        tipoBloqueio,
        idBarbeiro: tipoBloqueio === "geral" ? null : idBarbeiro,
        idBloqueioAgenda: ignoreId ? { not: ignoreId } : undefined,
        dataHoraInicio: {
          lt: dataHoraFim,
        },
        dataHoraFim: {
          gt: dataHoraInicio,
        },
      },
    });

    if (conflict) {
      throw new HttpError(409, "Ja existe um bloqueio de agenda sobreposto para este escopo");
    }
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
}
