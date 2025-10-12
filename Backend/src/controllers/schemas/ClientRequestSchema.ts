import { z } from "zod"
import { cpf } from "cpf-cnpj-validator"

export const CreateClientRequestSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(6).max(100),
    phone: z.string().min(10).max(15),
    address: z.string().min(10).max(100).optional(),
    cpf: z.string().transform((val) => val.replace(/\D/g, "")).refine((val) => cpf.isValid(val), {
        message: "CPF inválido"
    }).optional()
})

export const UpdateClientRequestSchema = z.object({
    name: z.string().optional(),
    email: z.email().optional(),
    password: z.string().min(6).max(100).optional(),
    phone: z.string().min(10).max(15).optional(),
    address: z.string().min(10).max(100).optional(),
    cpf: z.string().transform((val) => val.replace(/\D/g, "")).refine((val) => cpf.isValid(val), {
        message: "CPF inválido"
    }).optional()
})

export const GetClientsRequestSchema = z.object({
    page: z.string().optional(),
    pageSize: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    sortBy: z.enum(["name","createdAt", "updatedAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional()
})
