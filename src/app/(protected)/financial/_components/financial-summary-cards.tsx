"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  DollarSign,
  Minus,
  Plus,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCents, formatNumber } from "@/helpers/financial";

interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalTransactions: number;
  pendingAmount: number;
  appointmentCount: number;
  appointmentValue: number;
  // Contas a pagar
  totalPayables: number;
  pendingPayables: number;
  overduePayables: number;
  // Tendências calculadas em tempo real
  revenueTrend: number;
  expenseTrend: number;
  netProfitTrend: number;
  transactionTrend: number;
}

interface FinancialSummaryCardsProps {
  stats: FinancialStats;
}

export function FinancialSummaryCards({ stats }: FinancialSummaryCardsProps) {
  const averageAppointmentValue =
    stats.appointmentCount > 0
      ? stats.appointmentValue / stats.appointmentCount
      : 0;

  // Função para formatar tendência
  const formatTrend = (trend: number) => {
    const sign = trend >= 0 ? "+" : "";
    return `${sign}${trend.toFixed(1)}%`;
  };

  const cards = [
    {
      title: "Receitas",
      value: formatCurrencyInCents(stats.totalRevenue),
      icon: Plus,
      description: "Entradas (últimos 30 dias)",
      trend: formatTrend(stats.revenueTrend),
      trendUp: stats.revenueTrend >= 0,
      color: "text-green-600",
    },
    {
      title: "Despesas",
      value: formatCurrencyInCents(stats.totalExpenses),
      icon: Minus,
      description: "Saídas (últimos 30 dias)",
      trend: formatTrend(stats.expenseTrend),
      trendUp: stats.expenseTrend <= 0, // Para despesas, redução é positiva
      color: "text-red-600",
    },
    {
      title: "Lucro Líquido",
      value: formatCurrencyInCents(stats.netProfit),
      icon: DollarSign,
      description: "Receitas - Despesas",
      trend: formatTrend(stats.netProfitTrend),
      trendUp: stats.netProfitTrend >= 0,
      color: stats.netProfit >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Contas a Pagar",
      value: formatCurrencyInCents(stats.totalPayables),
      icon: AlertTriangle,
      description: `${stats.pendingPayables} pendentes, ${stats.overduePayables} vencidas`,
      trend: "",
      trendUp: true,
      color: stats.overduePayables > 0 ? "text-red-600" : "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              {card.trend && (
                <div className="text-muted-foreground flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1">
                    {card.trendUp ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        card.trendUp ? "text-green-500" : "text-red-500"
                      }
                    >
                      {card.trend}
                    </span>
                  </div>
                  <span>vs mês anterior</span>
                </div>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
