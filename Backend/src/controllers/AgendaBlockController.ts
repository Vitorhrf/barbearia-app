import type { Handler } from "express";
import { HttpError } from "../errors/HttpError.js";
import { AgendaBlockService } from "../services/AgendaBlockService.js";
import {
  CreateAgendaBlockRequestSchema,
  UpdateAgendaBlockRequestSchema,
} from "./schemas/AgendaBlockRequestSchema.js";

const agendaBlockService = new AgendaBlockService();

export class AgendaBlockController {
  index: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const idBarbeiroRaw = req.query.idBarbeiro;
      const idBarbeiro = typeof idBarbeiroRaw === "string" ? Number(idBarbeiroRaw) : undefined;

      const result = await agendaBlockService.list(req.tenant.idBarbearia, idBarbeiro);

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

      const body = CreateAgendaBlockRequestSchema.parse(req.body);
      const result = await agendaBlockService.create({
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

      const idBloqueioAgenda = Number(req.params.blockId);

      if (!Number.isInteger(idBloqueioAgenda) || idBloqueioAgenda <= 0) {
        throw new HttpError(400, "Identificador de bloqueio invalido");
      }

      const body = UpdateAgendaBlockRequestSchema.parse(req.body);
      const result = await agendaBlockService.update({
        idBarbearia: req.tenant.idBarbearia,
        idBloqueioAgenda,
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

      const idBloqueioAgenda = Number(req.params.blockId);

      if (!Number.isInteger(idBloqueioAgenda) || idBloqueioAgenda <= 0) {
        throw new HttpError(400, "Identificador de bloqueio invalido");
      }

      await agendaBlockService.delete(req.tenant.idBarbearia, idBloqueioAgenda);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
