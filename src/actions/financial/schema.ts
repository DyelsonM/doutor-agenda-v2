import { z } from "zod";

export const createTransactionSchema = z.object({
  appointmentId: z.string().uuid("ID da consulta inválido").optional(),
  type: z.enum(
    [
      "appointment_payment",
      "subscription_payment",
      "refund",
      "expense",
      "other",
    ],
    {
      errorMap: () => ({ message: "Tipo de transação inválido" }),
    },
  ),
  amountInCents: z.number().min(1, "Valor deve ser maior que zero"),
  description: z.string().min(1, "Descrição é obrigatória"),
  paymentMethod: z.enum(["stripe", "cash", "pix", "bank_transfer", "other"], {
    errorMap: () => ({ message: "Método de pagamento inválido" }),
  }),
  expenseCategory: z
    .enum([
      "rent",
      "utilities",
      "equipment",
      "supplies",
      "marketing",
      "staff",
      "insurance",
      "software",
      "other",
    ])
    .optional(),
  stripePaymentIntentId: z.string().optional(),
  stripeChargeId: z.string().optional(),
  metadata: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  id: z.string().uuid("ID da transação inválido"),
  status: z.enum(["pending", "completed", "failed", "cancelled", "refunded"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),
  description: z.string().min(1, "Descrição é obrigatória").optional(),
  metadata: z.string().optional(),
});

export const deleteTransactionSchema = z.object({
  id: z.string().uuid("ID da transação inválido"),
});

export const getFinancialReportSchema = z.object({
  reportType: z.enum(["daily", "monthly", "yearly"], {
    errorMap: () => ({ message: "Tipo de relatório inválido" }),
  }),
  periodStart: z.date(),
  periodEnd: z.date(),
});

export const getReportByIdSchema = z.object({
  id: z.string().uuid("ID do relatório inválido"),
});

export const deleteReportSchema = z.object({
  id: z.string().uuid("ID do relatório inválido"),
});
