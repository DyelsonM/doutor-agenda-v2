"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Bell, Check, CheckCheck, MoreVertical, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useClearAllNotifications,
  useDeleteNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "@/hooks/use-notifications";

dayjs.extend(relativeTime);

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    status: string;
    createdAt: string;
    data?: string;
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const isUnread = notification.status === "unread";

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_completed":
      case "appointment_reminder":
        return "📅";
      case "payable_due":
      case "payable_overdue":
        return "💰";
      case "payment_received":
        return "✅";
      case "payment_overdue":
        return "⚠️";
      default:
        return "🔔";
    }
  };

  return (
    <div
      className={`group relative border-b last:border-b-0 ${
        isUnread ? "border-l-4 border-l-blue-500 bg-blue-50" : ""
      }`}
    >
      <div
        className="flex w-full cursor-pointer items-start gap-3 p-4 hover:bg-gray-50"
        onClick={() => isUnread && onMarkAsRead(notification.id)}
      >
        <span className="mt-1 flex-shrink-0 text-lg">
          {getNotificationIcon(notification.type)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-medium">
              {notification.title}
            </h4>
            {isUnread && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-xs text-blue-800"
              >
                Novo
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {notification.message}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {dayjs(notification.createdAt).fromNow()}
          </p>
        </div>
      </div>

      {/* Botão de deletar - aparece no hover */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton className="h-6 w-6 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const unreadCount = useUnreadNotificationsCount();
  const {
    data: notifications,
    isLoading,
    refetch,
  } = useNotifications({ limit: 10 });

  // Contar notificações lidas
  const readNotifications =
    notifications?.notifications?.filter((n) => n.status === "read") || [];
  const readCount = readNotifications.length;
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  const clearAllNotifications = useClearAllNotifications();

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead.mutate(notificationId);
    refetch(); // Recarregar notificações após marcar como lida
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutate();
    refetch(); // Recarregar notificações após marcar todas como lidas
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification.mutate(notificationId);
    refetch(); // Recarregar notificações após deletar
  };

  const handleClearRead = async () => {
    await clearAllNotifications.mutate(true); // Deleta apenas as lidas
    refetch(); // Recarregar notificações após limpar
  };

  const handleClearAll = async () => {
    await clearAllNotifications.mutate(false); // Deleta todas
    refetch(); // Recarregar notificações após limpar
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 w-80">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                  disabled={markAllAsRead.isPending}
                >
                  <CheckCheck className="mr-1 h-3 w-3" />
                  Marcar todas como lidas
                </Button>
              )}

              {/* Menu de opções */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleClearRead}
                    disabled={
                      clearAllNotifications.isPending || readCount === 0
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar notificações lidas
                    {readCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {readCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        disabled={clearAllNotifications.isPending}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Limpar todas as notificações
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja limpar todas as notificações?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearAll}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Limpar todas
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : notifications?.notifications?.length ? (
            <div>
              {notifications.notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground p-8 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
