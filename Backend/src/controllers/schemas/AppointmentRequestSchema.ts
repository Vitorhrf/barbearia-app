import { z } from "zod"

export const CreateAppointmentRequestSchema = z.object({
    clientId: z.coerce.number(),
    barberId: z.coerce.number(),
    date: z.coerce.date().refine((val) => !isNaN(val.getTime()), {
        message: "Data inválida, formato correto: YYYY-MM-DDTHH:mm:ss"
    })
})

export const UpdateAppointmentRequestSchema = z.object({
    clientId: z.coerce.number().optional(),
    barberId: z.coerce.number().optional(),
    date: z.coerce.date().refine((val) => !isNaN(val.getTime()), {
        message: "Data inválida, formato correto: YYYY-MM-DDTHH:mm:ss"
    }).optional(),
    status: z.enum([
        "pending",
        "confirmed",
        "canceled",
        "completed"
    ]).optional()
})

export const GetAppointmentRequestSchema = z.object({
    page: z.coerce.number().min(1).optional(),
    pageSize: z.coerce.number().min(1).optional(),
    clientId: z.coerce.number().optional(),
    barberId: z.coerce.number().optional(),
    date: z.coerce.date().refine((val) => !isNaN(val.getTime()), {
        message: "Data inválida, formato correto: YYYY-MM-DD"
    }).optional(),
    status: z.enum([
        "pending",
        "confirmed",
        "canceled",
        "completed"
    ]).optional(),
    sortBy: z.enum([
        "clientId",
        "barberId",
        "date",
        "status"
    ]).optional(),
    order: z.enum([
        "asc",
        "desc"
    ]).optional()
})