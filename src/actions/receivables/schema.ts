import { z } from "zod";

export const createReceivableSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amountInCents: z.number().min(0.01, "Valor deve ser maior que zero"),
  category: z.enum(
    [
      "consultation",
      "procedure",
      "examination",
      "treatment",
      "medication",
      "equipment_rental",
      "professional_service",
      "insurance_reimbursement",
      "other",
    ],
    {
      errorMap: () => ({ message: "Categoria inválida" }),
    },
  ),
  dueDate: z.date({
    errorMap: () => ({ message: "Data de vencimento é obrigatória" }),
  }),
  patientName: z.string().optional(),
  patientDocument: z.string().optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const updateReceivableSchema = z.object({
  id: z.string().uuid("ID da conta a receber inválido"),
  description: z.string().min(1, "Descrição é obrigatória").optional(),
  amountInCents: z
    .number()
    .min(0.01, "Valor deve ser maior que zero")
    .optional(),
  category: z
    .enum(
      [
        "consultation",
        "procedure",
        "examination",
        "treatment",
        "medication",
        "equipment_rental",
        "professional_service",
        "insurance_reimbursement",
        "other",
      ],
      {
        errorMap: () => ({ message: "Categoria inválida" }),
      },
    )
    .optional(),
  dueDate: z.date().optional(),
  patientName: z.string().optional(),
  patientDocument: z.string().optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const markReceivableAsReceivedSchema = z.object({
  id: z.string().uuid("ID da conta a receber inválido"),
  receivedDate: z.date().optional(),
});

export const deleteReceivableSchema = z.object({
  id: z.string().uuid("ID da conta a receber inválido"),
});

export const getReceivablesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(["pending", "received", "overdue", "cancelled"]).optional(),
  category: z
    .enum([
      "consultation",
      "procedure",
      "examination",
      "treatment",
      "medication",
      "equipment_rental",
      "professional_service",
      "insurance_reimbursement",
      "other",
    ])
    .optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});
