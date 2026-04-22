import type { Handler } from "express";
import { HttpError } from "../errors/HttpError.js";
import { BarberService } from "../services/BarberService.js";
import {
  CreateBarberRequestSchema,
  GetBarbersRequestSchema,
  UpdateBarberRequestSchema,
} from "./schemas/BarberRequestSchema.js";

const barberService = new BarberService();

export class BarberController {
  index: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const query = GetBarbersRequestSchema.parse(req.query);
      const result = await barberService.getBarbers({
        idBarbearia: req.tenant.idBarbearia,
        ...query,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  show: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const idBarbeiro = Number(req.params.id);

      if (!Number.isInteger(idBarbeiro) || idBarbeiro <= 0) {
        throw new HttpError(400, "Identificador de barbeiro invalido");
      }

      const result = await barberService.getBarberById(req.tenant.idBarbearia, idBarbeiro);

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

      const body = CreateBarberRequestSchema.parse(req.body);
      const result = await barberService.createBarber({
        idBarbearia: req.tenant.idBarbearia,
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

      if (!Number.isInteger(idBarbeiro) || idBarbeiro <= 0) {
        throw new HttpError(400, "Identificador de barbeiro invalido");
      }

      const body = UpdateBarberRequestSchema.parse(req.body);
      const result = await barberService.updateBarber({
        idBarbearia: req.tenant.idBarbearia,
        idBarbeiro,
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

      if (!Number.isInteger(idBarbeiro) || idBarbeiro <= 0) {
        throw new HttpError(400, "Identificador de barbeiro invalido");
      }

      await barberService.deleteBarber(req.tenant.idBarbearia, idBarbeiro);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
