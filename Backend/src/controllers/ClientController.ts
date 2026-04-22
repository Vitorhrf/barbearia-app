import type { Handler } from "express";
import { HttpError } from "../errors/HttpError.js";
import { ClientService } from "../services/ClientService.js";
import {
  CreateClientRequestSchema,
  GetClientsRequestSchema,
  UpdateClientRequestSchema,
} from "./schemas/ClientRequestSchema.js";

const clientService = new ClientService();

export class ClientController {
  index: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const query = GetClientsRequestSchema.parse(req.query);
      const result = await clientService.getClients({
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

      const idCliente = Number(req.params.id);

      if (!Number.isInteger(idCliente) || idCliente <= 0) {
        throw new HttpError(400, "Identificador de cliente invalido");
      }

      const result = await clientService.getClientById(req.tenant.idBarbearia, idCliente);

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

      const body = CreateClientRequestSchema.parse(req.body);
      const result = await clientService.createClient({
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

      const idCliente = Number(req.params.id);

      if (!Number.isInteger(idCliente) || idCliente <= 0) {
        throw new HttpError(400, "Identificador de cliente invalido");
      }

      const body = UpdateClientRequestSchema.parse(req.body);
      const result = await clientService.updateClient({
        idBarbearia: req.tenant.idBarbearia,
        idCliente,
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

      const idCliente = Number(req.params.id);

      if (!Number.isInteger(idCliente) || idCliente <= 0) {
        throw new HttpError(400, "Identificador de cliente invalido");
      }

      await clientService.deleteClient(req.tenant.idBarbearia, idCliente);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
