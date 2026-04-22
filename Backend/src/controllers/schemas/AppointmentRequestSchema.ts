import { z } from "zod";

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

export const CreateAppointmentRequestSchema = z.object({
  idCliente: z.coerce.number().int().positive(),
  idBarbeiro: z.coerce.number().int().positive(),
  idServico: z.coerce.number().int().positive(),
  dataHoraInicio: z.coerce.date().refine(isValidDate, {
    message: "Data invalida, formato correto: YYYY-MM-DDTHH:mm:ss",
  }),
  status: z.enum(["pendente", "confirmado"]).optional(),
});

export const GetAvailableAppointmentsRequestSchema = z.object({
  idBarbeiro: z.coerce.number().int().positive(),
  idServico: z.coerce.number().int().positive(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Data invalida, formato correto: YYYY-MM-DD",
  }),
  inicioExpediente: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  fimExpediente: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  intervaloMin: z.coerce.number().int().min(5).max(120).optional(),
});
