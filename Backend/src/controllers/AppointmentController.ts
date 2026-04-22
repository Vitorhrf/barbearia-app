import type { Handler } from "express";
import { HttpError } from "../errors/HttpError.js";
import { AppointmentService } from "../services/AppointmentService.js";
import {
  CreateAppointmentRequestSchema,
  GetAvailableAppointmentsRequestSchema,
} from "./schemas/AppointmentRequestSchema.js";

const appointmentService = new AppointmentService();

export class AppointmentController {
  create: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const body = CreateAppointmentRequestSchema.parse(req.body);
      const result = await appointmentService.createAppointment({
        idBarbearia: req.tenant.idBarbearia,
        ...body,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  available: Handler = async (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new HttpError(401, "Contexto de barbearia nao carregado");
      }

      const query = GetAvailableAppointmentsRequestSchema.parse(req.query);
      const result = await appointmentService.getAvailableAppointments({
        idBarbearia: req.tenant.idBarbearia,
        ...query,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
