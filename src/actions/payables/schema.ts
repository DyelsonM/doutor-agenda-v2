import { z } from "zod";

export const createPayableSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amountInCents: z.number().min(1, "Valor deve ser maior que zero"),
  category: z.enum(
    [
      "rent",
      "utilities",
      "equipment",
      "supplies",
      "marketing",
      "staff",
      "insurance",
      "software",
      "laboratory",
      "shipping",
      "maintenance",
      "professional_services",
      "taxes",
      "other",
    ],
    {
      errorMap: () => ({ message: "Categoria inválida" }),
    },
  ),
  dueDate: z.date({
    errorMap: () => ({ message: "Data de vencimento é obrigatória" }),
  }),
  supplierName: z.string().optional(),
  supplierDocument: z.string().optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePayableSchema = z.object({
  id: z.string().uuid("ID da conta a pagar inválido"),
  description: z.string().min(1, "Descrição é obrigatória").optional(),
  amountInCents: z.number().min(1, "Valor deve ser maior que zero").optional(),
  category: z
    .enum(
      [
        "rent",
        "utilities",
        "equipment",
        "supplies",
        "marketing",
        "staff",
        "insurance",
        "software",
        "laboratory",
        "shipping",
        "maintenance",
        "professional_services",
        "taxes",
        "other",
      ],
      {
        errorMap: () => ({ message: "Categoria inválida" }),
      },
    )
    .optional(),
  dueDate: z.date().optional(),
  supplierName: z.string().optional(),
  supplierDocument: z.string().optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const markPayableAsPaidSchema = z.object({
  id: z.string().uuid("ID da conta a pagar inválido"),
  paidDate: z.date().optional(),
});

export const deletePayableSchema = z.object({
  id: z.string().uuid("ID da conta a pagar inválido"),
});

export const getPayablesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
  category: z
    .enum([
      "rent",
      "utilities",
      "equipment",
      "supplies",
      "marketing",
      "staff",
      "insurance",
      "software",
      "laboratory",
      "shipping",
      "maintenance",
      "professional_services",
      "taxes",
      "other",
    ])
    .optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});
