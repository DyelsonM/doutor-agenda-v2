import { z } from "zod";

export const updateClinicSchema = z.object({
  clinicId: z.string().uuid({ message: "ID da clínica inválido" }),

  // Informações básicas
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  logoUrl: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),

  // Contato
  email: z
    .string()
    .email({ message: "Email inválido" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z
    .string()
    .url({ message: "Website deve ser uma URL válida" })
    .optional()
    .or(z.literal("")),

  // Endereço
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  country: z.string().default("Brasil"),

  // Documentos
  cnpj: z.string().optional().or(z.literal("")),
  crmNumber: z.string().optional().or(z.literal("")),
});

export type UpdateClinicSchema = z.infer<typeof updateClinicSchema>;
