import { z } from "zod"

export const CreateProductRequestSchema = z.object({
    name: z.string().min(2).max(100),
    price: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val > 0, {
        message: "Preço inválido"
    }),
    stock: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val >= 0, {
        message: "Estoque inválido"
    })
})

export const UpdateProductRequestSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    price: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val > 0, {
        message: "Preço inválido"
    }).optional(),
    stock: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val >= 0, {
        message: "Estoque inválido"
    }).optional()
})

export const GetProductRequestSchema = z.object({
    page: z.string().optional(),
    pageSize: z.string().optional(),
    name: z.string().min(2).max(100).optional(),
    price: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    stock: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
    sortBy: z.enum(["name", "price", "stock"]).optional(),
    order: z.enum(["asc", "desc"]).optional()
})
