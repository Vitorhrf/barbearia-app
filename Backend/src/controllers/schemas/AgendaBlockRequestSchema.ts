import { z } from "zod";

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

export const CreateAgendaBlockRequestSchema = z.object({
  idBarbeiro: z.coerce.number().int().positive().optional(),
  dataHoraInicio: z.coerce.date().refine(isValidDate, {
    message: "Data/hora de inicio invalida",
  }),
  dataHoraFim: z.coerce.date().refine(isValidDate, {
    message: "Data/hora de fim invalida",
  }),
  motivo: z.string().max(500).optional(),
  tipoBloqueio: z.enum(["barbeiro", "geral"]),
});

export const UpdateAgendaBlockRequestSchema = z.object({
  idBarbeiro: z.coerce.number().int().positive().nullable().optional(),
  dataHoraInicio: z.coerce.date().refine(isValidDate, {
    message: "Data/hora de inicio invalida",
  }).optional(),
  dataHoraFim: z.coerce.date().refine(isValidDate, {
    message: "Data/hora de fim invalida",
  }).optional(),
  motivo: z.string().max(500).optional(),
  tipoBloqueio: z.enum(["barbeiro", "geral"]).optional(),
});
