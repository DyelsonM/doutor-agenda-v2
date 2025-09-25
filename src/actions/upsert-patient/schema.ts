import { z } from "zod";

export const upsertPatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  email: z
    .string()
    .email({
      message: "Email inválido.",
    })
    .optional()
    .or(z.literal("")),
  phoneNumber: z.string().trim().min(1, {
    message: "Número de telefone é obrigatório.",
  }),
  cpf: z.string().optional().or(z.literal("")),
  responsiblePhoneNumber: z.string().optional().or(z.literal("")),
  responsibleName: z.string().optional().or(z.literal("")),
  sex: z.enum(["male", "female"], {
    required_error: "Sexo é obrigatório.",
  }),
  patientType: z.enum(
    ["particular", "cliente ouro", "convenio", "odontologico"],
    {
      required_error: "Tipo de paciente é obrigatório.",
    },
  ),
  insuranceName: z.string().optional().or(z.literal("")),
});

export type UpsertPatientSchema = z.infer<typeof upsertPatientSchema>;
