import { z } from "zod";

export const CreateBarberRequestSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.email(),
  senha: z.string().min(6).max(100),
  telefone: z.string().min(10).max(15).optional(),
  especialidade: z.string().max(120).optional(),
  comissao: z.coerce.number().min(0).max(1).optional(),
});

export const UpdateBarberRequestSchema = z.object({
  nome: z.string().min(2).max(120).optional(),
  email: z.email().optional(),
  senha: z.string().min(6).max(100).optional(),
  telefone: z.string().min(10).max(15).optional(),
  especialidade: z.string().max(120).optional(),
  comissao: z.coerce.number().min(0).max(1).optional(),
});

export const GetBarbersRequestSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  nome: z.string().optional(),
  email: z.string().optional(),
  telefone: z.string().optional(),
  especialidade: z.string().optional(),
  sortBy: z.enum(["idBarbeiro", "telefone", "especialidade", "comissao", "nome", "email", "dataCriacao"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
