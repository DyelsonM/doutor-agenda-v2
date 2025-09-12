import { z } from "zod";

export const upsertDocumentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid("Selecione um paciente"),
  doctorId: z.string().uuid("Selecione um médico"),
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
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(255, "Título deve ter no máximo 255 caracteres"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});
