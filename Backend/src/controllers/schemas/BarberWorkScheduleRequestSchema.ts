import { z } from "zod";

const timePattern = /^\d{2}:\d{2}$/;

export const CreateBarberWorkScheduleRequestSchema = z.object({
  diaSemana: z.enum(["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]),
  horaInicio: z.string().regex(timePattern, "Hora de inicio invalida, formato correto: HH:mm"),
  horaFim: z.string().regex(timePattern, "Hora de fim invalida, formato correto: HH:mm"),
});

export const UpdateBarberWorkScheduleRequestSchema = z.object({
  diaSemana: z.enum(["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]).optional(),
  horaInicio: z.string().regex(timePattern, "Hora de inicio invalida, formato correto: HH:mm").optional(),
  horaFim: z.string().regex(timePattern, "Hora de fim invalida, formato correto: HH:mm").optional(),
  ativo: z.boolean().optional(),
});
