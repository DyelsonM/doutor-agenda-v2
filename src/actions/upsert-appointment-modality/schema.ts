import { z } from "zod";

export const upsertAppointmentModalitySchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(1, {
    message: "Código é obrigatório.",
  }),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  category: z.string().trim().min(1, {
    message: "Categoria é obrigatória.",
  }),
  description: z.string().optional().or(z.literal("")),
});

export type UpsertAppointmentModalitySchema = z.infer<
  typeof upsertAppointmentModalitySchema
>;
