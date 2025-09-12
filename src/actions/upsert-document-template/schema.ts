import { z } from "zod";

export const upsertDocumentTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  type: z.enum(
    [
      "anamnesis",
      "prescription",
      "medical_certificate",
      "exam_request",
      "medical_report",
      "referral_form",
      "other",
    ],
    {
      required_error: "Selecione um tipo de documento",
    },
  ),
  content: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});
