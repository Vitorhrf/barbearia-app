import { z } from "zod";

export const CreateClientRequestSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.email(),
  senha: z.string().min(6).max(100),
  telefone: z.string().min(10).max(15).optional(),
  dataNascimento: z.coerce.date().optional(),
  observacoes: z.string().max(500).optional(),
});

export const UpdateClientRequestSchema = z.object({
  nome: z.string().min(2).max(120).optional(),
  email: z.email().optional(),
  senha: z.string().min(6).max(100).optional(),
  telefone: z.string().min(10).max(15).optional(),
  dataNascimento: z.coerce.date().optional(),
  observacoes: z.string().max(500).optional(),
});

export const GetClientsRequestSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  nome: z.string().optional(),
  email: z.string().optional(),
  telefone: z.string().optional(),
  sortBy: z.enum(["idCliente", "telefone", "dataNascimento", "observacoes", "nome", "email", "dataCriacao"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
