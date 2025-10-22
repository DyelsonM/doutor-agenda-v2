import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string(),
  clinicId: z.string(),
  type: z.enum([
    "appointment_reminder",
    "appointment_cancelled",
    "appointment_completed",
    "payment_received",
    "payment_overdue",
    "payable_due",
    "payable_overdue",
    "system_update",
  ]),
  title: z.string().min(1),
  message: z.string().min(1),
  data: z.string().optional(), // JSON string
});

export const markNotificationAsReadSchema = z.object({
  notificationId: z.string(),
});

export const getNotificationsSchema = z.object({
  status: z.enum(["unread", "read", "archived"]).optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export const deleteNotificationSchema = z.object({
  notificationId: z.string(),
});

export const clearAllNotificationsSchema = z.object({
  onlyRead: z.boolean().optional().default(false), // Se true, deleta apenas as lidas
});
