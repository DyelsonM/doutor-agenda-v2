"use server";

import { eq, and, desc, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import {
  createNotificationSchema,
  markNotificationAsReadSchema,
  getNotificationsSchema,
  deleteNotificationSchema,
  clearAllNotificationsSchema,
} from "./schema";

export const createNotification = actionClient
  .schema(createNotificationSchema)
  .action(async ({ parsedInput }) => {
    await db.insert(notificationsTable).values({
      userId: parsedInput.userId,
      clinicId: parsedInput.clinicId,
      type: parsedInput.type,
      title: parsedInput.title,
      message: parsedInput.message,
      data: parsedInput.data,
    });

    return { success: true };
  });

export const markNotificationAsRead = actionClient
  .schema(markNotificationAsReadSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .update(notificationsTable)
      .set({
        status: "read",
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notificationsTable.id, parsedInput.notificationId),
          eq(notificationsTable.userId, session.user.id),
        ),
      );

    return { success: true };
  });

export const getNotifications = actionClient
  .schema(getNotificationsSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    const whereConditions = [
      eq(notificationsTable.userId, session.user.id),
      eq(notificationsTable.clinicId, session.user.clinic.id),
    ];

    if (parsedInput.status) {
      whereConditions.push(eq(notificationsTable.status, parsedInput.status));
    }

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(and(...whereConditions))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(parsedInput.limit)
      .offset(parsedInput.offset);

    // Contar total de notificações não lidas
    const unreadCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.userId, session.user.id),
          eq(notificationsTable.clinicId, session.user.clinic.id),
          eq(notificationsTable.status, "unread"),
        ),
      );

    return {
      notifications,
      unreadCount: unreadCount[0]?.count || 0,
    };
  });

export const markAllNotificationsAsRead = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  await db
    .update(notificationsTable)
    .set({
      status: "read",
      readAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notificationsTable.userId, session.user.id),
        eq(notificationsTable.clinicId, session.user.clinic.id),
        eq(notificationsTable.status, "unread"),
      ),
    );

  return { success: true };
});

export const deleteNotification = actionClient
  .schema(deleteNotificationSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .delete(notificationsTable)
      .where(
        and(
          eq(notificationsTable.id, parsedInput.notificationId),
          eq(notificationsTable.userId, session.user.id),
        ),
      );

    return { success: true };
  });

export const clearAllNotifications = actionClient
  .schema(clearAllNotificationsSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    const whereConditions = [
      eq(notificationsTable.userId, session.user.id),
      eq(notificationsTable.clinicId, session.user.clinic.id),
    ];

    // Se onlyRead for true, deleta apenas as notificações lidas
    if (parsedInput.onlyRead) {
      whereConditions.push(eq(notificationsTable.status, "read"));
    }

    await db.delete(notificationsTable).where(and(...whereConditions));

    return { success: true };
  });
