import { z } from "zod"

export const CreateSaleRequestSchema = z.object({
    clientId: z.string().transform((val) => parseInt(val, 10)),
    barberId: z.string().transform((val) => parseInt(val, 10)),
    serviceId: z.string().transform((val) => parseInt(val, 10)),
    quantity: z.string().transform((val) =>  parseInt(val, 10)).refine(val => val > 0, {
        message: "A quantidade deve ser maior que 0"
    })
})

export const GetSalesRequestSchema = z.object({
    page: z.string().optional(),
    pageSize: z.string().optional(),
    clientId: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
    barberId: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
    serviceId: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
    sortBy: z.enum(["clientId", "barberId", "serviceId", "createdAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional()
})

export const UpdateSaleRequestSchema = z.object({
    clientId: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
    barberId: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
    serviceId: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
    quantity: z.string()
        .optional()
        .refine(val => val === undefined || (!isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0), {
            message: "A quantidade deve ser um número maior que 0"
        })
        .transform(val => (val ? parseInt(val, 10) : undefined))
})
