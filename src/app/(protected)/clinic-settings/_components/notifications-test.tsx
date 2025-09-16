"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { checkPayablesDue } from "@/actions/check-payables-due";

export function NotificationsTest() {
  const { execute, isExecuting } = useAction(checkPayablesDue);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const handleTestNotifications = async () => {
    try {
      const result = await execute({});
      if (result?.data?.success) {
        setLastCheck(new Date());
        toast.success(
          result.data.message || "Verificação de notificações concluída",
        );
      }
    } catch (error) {
      toast.error("Erro ao verificar notificações");
      console.error("Error testing notifications:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Sistema de Notificações
        </CardTitle>
        <CardDescription>
          Teste e configure o sistema de notificações automáticas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground space-y-2 text-sm">
          <p>• Notificações são criadas automaticamente quando:</p>
          <ul className="ml-4 space-y-1">
            <li>- Um novo agendamento é criado</li>
            <li>
              - Uma conta a pagar está próxima do vencimento (2 dias antes)
            </li>
          </ul>
          <p>
            • O sistema verifica contas próximas ao vencimento a cada hora
            automaticamente
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleTestNotifications}
            disabled={isExecuting}
            variant="outline"
          >
            <Bell className="mr-2 h-4 w-4" />
            {isExecuting ? "Verificando..." : "Verificar Contas Agora"}
          </Button>

          {lastCheck && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Última verificação: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
