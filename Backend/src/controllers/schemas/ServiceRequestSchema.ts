import { z } from "zod";

export const CreateServiceRequestSchema = z.object({
  nome: z.string().min(2).max(120),
  descricao: z.string().max(500).optional(),
  preco: z.coerce.number().positive(),
  duracaoMin: z.coerce.number().int().min(1).max(1440),
});

export const UpdateServiceRequestSchema = z.object({
  nome: z.string().min(2).max(120).optional(),
  descricao: z.string().max(500).optional(),
  preco: z.coerce.number().positive().optional(),
  duracaoMin: z.coerce.number().int().min(1).max(1440).optional(),
});

export const GetServicesRequestSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  nome: z.string().optional(),
  descricao: z.string().optional(),
  sortBy: z.enum(["nome", "descricao", "preco", "duracaoMin"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
