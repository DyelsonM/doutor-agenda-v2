import { z } from "zod";

export const dependentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().optional().or(z.literal("")),
  phone: z
    .union([z.string().trim(), z.null(), z.undefined()])
    .optional()
    .transform((val) => (val === "" || val === null ? undefined : val)),
  birthDate: z.string().trim().optional().or(z.literal("")),
});

export const upsertGoldClientSchema = z.object({
  id: z.string().uuid().optional(),
  holderName: z.string().trim().optional().or(z.literal("")),
  holderCpf: z.string().trim().optional().or(z.literal("")),
  holderPhone: z.string().trim().optional().or(z.literal("")),
  holderBirthDate: z.string().trim().optional().or(z.literal("")),
  holderAddress: z.string().trim().optional().or(z.literal("")),
  holderZipCode: z.string().trim().optional().or(z.literal("")),
  dependents: z
    .array(dependentSchema)
    .max(10, {
      message: "Máximo de 10 dependentes permitidos.",
    })
    .optional()
    .default([]),
});

export type UpsertGoldClientSchema = z.infer<typeof upsertGoldClientSchema>;
export type DependentSchema = z.infer<typeof dependentSchema>;
