import { z } from "zod";

export const upsertMedicalSpecialtySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  category: z.string().trim().min(1, {
    message: "Categoria é obrigatória.",
  }),
});

export type UpsertMedicalSpecialtySchema = z.infer<
  typeof upsertMedicalSpecialtySchema
>;
