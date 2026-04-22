import type { Handler } from "express";
import { HttpError } from "../errors/HttpError.js";
import { ServiceService } from "../services/ServiceService.js";
import {
  CreateServiceRequestSchema,
  GetServicesRequestSchema,
  UpdateServiceRequestSchema,
} from "./schemas/ServiceRequestSchema.js";

const serviceService = new ServiceService();

export class ServiceController {
  index: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const query = GetServicesRequestSchema.parse(req.query);
      const result = await serviceService.getServices({
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

      const idServico = Number(req.params.id);

      if (!Number.isInteger(idServico) || idServico <= 0) {
        throw new HttpError(400, "Identificador de servico invalido");
      }

      const result = await serviceService.getServiceById(req.tenant.idBarbearia, idServico);

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

      const body = CreateServiceRequestSchema.parse(req.body);
      const result = await serviceService.createService({
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

      const idServico = Number(req.params.id);

      if (!Number.isInteger(idServico) || idServico <= 0) {
        throw new HttpError(400, "Identificador de servico invalido");
      }

      const body = UpdateServiceRequestSchema.parse(req.body);
      const result = await serviceService.updateService({
        idBarbearia: req.tenant.idBarbearia,
        idServico,
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

      const idServico = Number(req.params.id);

      if (!Number.isInteger(idServico) || idServico <= 0) {
        throw new HttpError(400, "Identificador de servico invalido");
      }

      await serviceService.deleteService(req.tenant.idBarbearia, idServico);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
