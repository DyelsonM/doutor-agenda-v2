import { z } from "zod";

export const upsertPartnerExamSchema = z.object({
  id: z.string().uuid().optional(),
  partnerId: z.string().uuid(),
  code: z.string().trim().min(1, {
    message: "Código/Sigla é obrigatório.",
  }),
  name: z.string().trim().min(1, {
    message: "Nome do exame é obrigatório.",
  }),
  popularPriceInCents: z
    .number()
    .min(0, {
      message: "Valor CL Popular deve ser maior ou igual a 0.",
    })
    .optional(),
  particularPriceInCents: z
    .number()
    .min(0, {
      message: "Valor Particular deve ser maior ou igual a 0.",
    })
    .optional(),
});

export type UpsertPartnerExamSchema = z.infer<typeof upsertPartnerExamSchema>;
