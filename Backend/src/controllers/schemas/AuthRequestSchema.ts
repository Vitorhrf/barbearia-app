import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
  barbeariaId: z.coerce.number().int().positive().optional(),
});
