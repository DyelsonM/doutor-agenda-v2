import { z } from "zod";

export const dependentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome do dependente é obrigatório.",
  }),
  phone: z.string().trim().min(1, {
    message: "Telefone do dependente é obrigatório.",
  }),
  birthDate: z.date({
    required_error: "Data de nascimento do dependente é obrigatória.",
  }),
});

export const upsertGoldClientSchema = z.object({
  id: z.string().uuid().optional(),
  holderName: z.string().trim().min(1, {
    message: "Nome completo do titular é obrigatório.",
  }),
  holderCpf: z.string().trim().min(1, {
    message: "CPF do titular é obrigatório.",
  }),
  holderPhone: z.string().trim().min(1, {
    message: "Telefone do titular é obrigatório.",
  }),
  holderBirthDate: z.date({
    required_error: "Data de nascimento do titular é obrigatória.",
  }),
  holderAddress: z.string().trim().min(1, {
    message: "Endereço completo do titular é obrigatório.",
  }),
  holderZipCode: z.string().trim().min(1, {
    message: "CEP do titular é obrigatório.",
  }),
  dependents: z.array(dependentSchema).max(5, {
    message: "Máximo de 5 dependentes permitidos.",
  }),
});

export type UpsertGoldClientSchema = z.infer<typeof upsertGoldClientSchema>;
export type DependentSchema = z.infer<typeof dependentSchema>;
