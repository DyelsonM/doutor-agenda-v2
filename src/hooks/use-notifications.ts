"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";

import {
  clearAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notifications";

export function useNotifications(options?: {
  status?: "unread" | "read" | "archived";
  limit?: number;
  offset?: number;
}) {
  const { execute, result, isExecuting } = useAction(getNotifications);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Serialize options to avoid dependency issues
  const optionsString = JSON.stringify(options || {});

  useEffect(() => {
    execute(options || {});
  }, [shouldRefetch, optionsString]); // Use string version to avoid object reference issues

  // Auto-refresh a cada 30 segundos para notificações não lidas
  useEffect(() => {
    if (options?.status === "unread" || !options?.status) {
      const interval = setInterval(() => {
        execute(options || {});
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [options?.status, optionsString]); // Use string version for consistency

  const refetch = () => {
    setShouldRefetch((prev) => !prev);
  };

  return {
    data: result?.data,
    isLoading: isExecuting,
    refetch,
  };
}

export function useMarkNotificationAsRead() {
  const { execute, isExecuting } = useAction(markNotificationAsRead);

  return {
    mutate: async (notificationId: string) => {
      await execute({ notificationId });
    },
    isPending: isExecuting,
  };
}

export function useMarkAllNotificationsAsRead() {
  const { execute, isExecuting } = useAction(markAllNotificationsAsRead);

  return {
    mutate: async () => {
      await execute({});
    },
    isPending: isExecuting,
  };
}

// Hook para buscar apenas o contador de notificações não lidas
export function useUnreadNotificationsCount() {
  const { data } = useNotifications({ status: "unread", limit: 1 });
  return data?.unreadCount || 0;
}

export function useDeleteNotification() {
  const { execute, isExecuting } = useAction(deleteNotification);

  return {
    mutate: async (notificationId: string) => {
      await execute({ notificationId });
    },
    isPending: isExecuting,
  };
}

export function useClearAllNotifications() {
  const { execute, isExecuting } = useAction(clearAllNotifications);

  return {
    mutate: async (onlyRead: boolean = false) => {
      await execute({ onlyRead });
    },
    isPending: isExecuting,
  };
}
