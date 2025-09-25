import { z } from "zod";

export const upsertPartnerSchema = z.object({
  id: z.string().uuid().optional(),
  companyName: z.string().trim().min(1, {
    message: "Razão Social é obrigatória.",
  }),
  tradeName: z.string().trim().optional(),
  cnpj: z.string().trim().min(1, {
    message: "CNPJ é obrigatório.",
  }),
  address: z.string().trim().min(1, {
    message: "Endereço é obrigatório.",
  }),
  responsibleName: z.string().trim().min(1, {
    message: "Nome do responsável é obrigatório.",
  }),
  responsiblePhone: z.string().trim().min(1, {
    message: "Celular do responsável é obrigatório.",
  }),
  receptionPhone1: z.string().trim().optional(),
  receptionPhone2: z.string().trim().optional(),
  receptionPhone3: z.string().trim().optional(),
  paymentFrequency: z.enum(["weekly", "biweekly", "monthly", "quarterly"], {
    required_error: "Frequência de pagamento é obrigatória.",
  }),
  pixKey: z.string().trim().min(1, {
    message: "Chave PIX é obrigatória.",
  }),
  pixType: z.enum(["cpf", "cnpj", "email", "phone", "random_key"], {
    required_error: "Tipo da chave PIX é obrigatório.",
  }),
});

export type UpsertPartnerSchema = z.infer<typeof upsertPartnerSchema>;
