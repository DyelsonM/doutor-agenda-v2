"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Lock,
} from "lucide-react";
import Link from "next/link";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyInCents } from "@/helpers/financial";

interface CashStatusCardProps {
  cash: {
    id: string;
    date: Date;
    status: "open" | "closed" | "suspended";
    identifier?: string | null;
    openingTime: Date;
    closingTime?: Date | null;
    openingAmount: number;
    closingAmount?: number | null;
    expectedAmount?: number | null;
    difference?: number | null;
    totalCashIn: number;
    totalCashOut: number;
    openingNotes?: string | null;
    closingNotes?: string | null;
    user: {
      name: string;
    };
    operations: Array<{
      id: string;
      type: string;
      amountInCents: number;
      description: string;
      createdAt: Date;
    }>;
  } | null;
}

export function CashStatusCard({ cash }: CashStatusCardProps) {
  if (!cash) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Caixa Não Aberto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Nenhum caixa foi aberto para hoje. Abra um caixa para começar a
              trabalhar.
            </p>
            <Link href="/daily-cash/open">
              <Button className="w-full">
                <DollarSign className="mr-2 h-4 w-4" />
                Abrir Caixa
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusInfo = () => {
    switch (cash.status) {
      case "open":
        return {
          icon: <Clock className="h-5 w-5 text-green-500" />,
          label: "Aberto",
          variant: "default" as const,
          color: "text-green-600",
        };
      case "closed":
        return {
          icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
          label: "Fechado",
          variant: "secondary" as const,
          color: "text-blue-600",
        };
      case "suspended":
        return {
          icon: <Lock className="h-5 w-5 text-orange-500" />,
          label: "Suspenso",
          variant: "destructive" as const,
          color: "text-orange-600",
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          label: "Desconhecido",
          variant: "outline" as const,
          color: "text-gray-600",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isOpen = cash.status === "open";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            Status do Caixa
            {cash.identifier && (
              <span className="text-muted-foreground">- {cash.identifier}</span>
            )}
            {" - "}
            {cash.date
              ? format(
                  dayjs(cash.date).utc().tz("America/Sao_Paulo").toDate(),
                  "dd/MM/yyyy",
                  { locale: ptBR },
                )
              : "Data não disponível"}
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Informações básicas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Aberto por:</p>
              <p className="font-medium">{cash.user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Horário de abertura:</p>
              <p className="font-medium">
                {cash.openingTime
                  ? format(
                      dayjs(cash.openingTime)
                        .utc()
                        .tz("America/Sao_Paulo")
                        .toDate(),
                      "HH:mm",
                      {
                        locale: ptBR,
                      },
                    )
                  : "Horário não disponível"}
              </p>
            </div>
          </div>

          {cash.closingTime && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Horário de fechamento:</p>
                <p className="font-medium">
                  {cash.closingTime
                    ? format(
                        dayjs(cash.closingTime)
                          .utc()
                          .tz("America/Sao_Paulo")
                          .toDate(),
                        "HH:mm",
                        {
                          locale: ptBR,
                        },
                      )
                    : "Horário não disponível"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor final:</p>
                <p className="font-medium">
                  {formatCurrencyInCents(cash.closingAmount || 0)}
                </p>
              </div>
            </div>
          )}

          {/* Valores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Valor inicial:
                </span>
                <span className="font-medium">
                  {formatCurrencyInCents(cash.openingAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Entradas:</span>
                <span className="font-medium text-green-600">
                  +{formatCurrencyInCents(cash.totalCashIn)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Saídas:</span>
                <span className="font-medium text-red-600">
                  -{formatCurrencyInCents(cash.totalCashOut)}
                </span>
              </div>
            </div>
            {cash.expectedAmount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Esperado:</span>
                <span className="font-medium">
                  {formatCurrencyInCents(cash.expectedAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Diferença */}
          {cash.difference !== null && cash.difference !== undefined && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Diferença:</span>
                <span
                  className={`font-bold ${
                    cash.difference >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {cash.difference >= 0 ? "+" : ""}
                  {formatCurrencyInCents(cash.difference)}
                </span>
              </div>
            </div>
          )}

          {/* Observações */}
          {(cash.openingNotes || cash.closingNotes) && (
            <div className="border-t pt-4">
              <h4 className="mb-2 text-sm font-medium">Observações:</h4>
              {cash.openingNotes && (
                <div className="text-muted-foreground text-sm">
                  <strong>Abertura:</strong> {cash.openingNotes}
                </div>
              )}
              {cash.closingNotes && (
                <div className="text-muted-foreground text-sm">
                  <strong>Fechamento:</strong> {cash.closingNotes}
                </div>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              {isOpen ? (
                <>
                  <Link href="/daily-cash/operations" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Operações
                    </Button>
                  </Link>
                  <Link href="/daily-cash/close" className="flex-1">
                    <Button className="w-full">
                      <Lock className="mr-2 h-4 w-4" />
                      Fechar Caixa
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/daily-cash/details" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href="/daily-cash/open" className="flex-1">
                    <Button className="w-full">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Abrir Novo Caixa
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
