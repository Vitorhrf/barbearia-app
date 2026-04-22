import type { Handler } from "express";
import { HttpError } from "../errors/HttpError.js";
import { BarberWorkScheduleService } from "../services/BarberWorkScheduleService.js";
import {
  CreateBarberWorkScheduleRequestSchema,
  UpdateBarberWorkScheduleRequestSchema,
} from "./schemas/BarberWorkScheduleRequestSchema.js";

const barberWorkScheduleService = new BarberWorkScheduleService();

export class BarberWorkScheduleController {
  index: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const idBarbeiro = Number(req.params.id);

      if (!Number.isInteger(idBarbeiro) || idBarbeiro <= 0) {
        throw new HttpError(400, "Identificador de barbeiro invalido");
      }

      const result = await barberWorkScheduleService.list(req.tenant.idBarbearia, idBarbeiro);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const idBarbeiro = Number(req.params.id);

      if (!Number.isInteger(idBarbeiro) || idBarbeiro <= 0) {
        throw new HttpError(400, "Identificador de barbeiro invalido");
      }

      const body = CreateBarberWorkScheduleRequestSchema.parse(req.body);
      const result = await barberWorkScheduleService.create({
        idBarbearia: req.tenant.idBarbearia,
        idBarbeiro,
        ...body,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  update: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const idBarbeiro = Number(req.params.id);
      const idHorarioTrabalho = Number(req.params.scheduleId);

      if (!Number.isInteger(idBarbeiro) || idBarbeiro <= 0 || !Number.isInteger(idHorarioTrabalho) || idHorarioTrabalho <= 0) {
        throw new HttpError(400, "Identificador invalido");
      }

      const body = UpdateBarberWorkScheduleRequestSchema.parse(req.body);
      const result = await barberWorkScheduleService.update({
        idBarbearia: req.tenant.idBarbearia,
        idBarbeiro,
        idHorarioTrabalho,
        ...body,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  delete: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const idBarbeiro = Number(req.params.id);
      const idHorarioTrabalho = Number(req.params.scheduleId);

      if (!Number.isInteger(idBarbeiro) || idBarbeiro <= 0 || !Number.isInteger(idHorarioTrabalho) || idHorarioTrabalho <= 0) {
        throw new HttpError(400, "Identificador invalido");
      }

      await barberWorkScheduleService.delete(req.tenant.idBarbearia, idBarbeiro, idHorarioTrabalho);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
