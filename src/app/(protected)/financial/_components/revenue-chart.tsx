"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartData {
  date: Date;
  amount: number;
}

interface RevenueChartProps {
  revenueData: ChartData[];
  expenseData: ChartData[];
}

// Função helper para garantir data local
function getLocalDateString(date: Date | string): string {
  if (typeof date === "string") {
    // Se já é string, verificar se está no formato correto
    if (date.includes("T")) {
      // Se tem timestamp, extrair apenas a data
      return date.split("T")[0];
    }
    return date;
  }

  // Para Date objects, usar timezone local explícito
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function RevenueChart({ revenueData, expenseData }: RevenueChartProps) {
  // Debug: Log dos dados recebidos
  console.log("=== DEBUG FRONTEND ===");
  console.log("Revenue Data:", revenueData);
  console.log("Expense Data:", expenseData);

  // Criar um mapa de datas para combinar receitas e despesas
  const dateMap = new Map<string, { revenue: number; expense: number }>();

  // Processar dados de receitas
  revenueData.forEach((item) => {
    const dateStr = getLocalDateString(item.date);
    const amount = item.amount ? item.amount / 100 : 0;
    const existing = dateMap.get(dateStr) || { revenue: 0, expense: 0 };
    dateMap.set(dateStr, { ...existing, revenue: existing.revenue + amount });

    console.log(
      `Receita processada: ${item.date} -> ${dateStr} = R$ ${amount}`,
    );
  });

  // Processar dados de despesas
  expenseData.forEach((item) => {
    const dateStr = getLocalDateString(item.date);
    const amount = item.amount ? item.amount / 100 : 0;
    const existing = dateMap.get(dateStr) || { revenue: 0, expense: 0 };
    dateMap.set(dateStr, { ...existing, expense: existing.expense + amount });

    console.log(
      `Despesa processada: ${item.date} -> ${dateStr} = R$ ${amount}`,
    );
  });

  // Gerar 7 dias: 4 passados + hoje + 2 futuros
  const today = new Date();
  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (4 - i)); // -4, -3, -2, -1, 0, +1, +2
    return getLocalDateString(date);
  });

  // Converter para array e incluir todos os 7 dias
  const chartData = chartDays.map((dateKey) => {
    const amounts = dateMap.get(dateKey) || { revenue: 0, expense: 0 };
    const date = new Date(dateKey);
    const todayStr = getLocalDateString(new Date());

    const isToday = dateKey === todayStr;

    // Usar conversão manual em vez de date-fns para evitar problemas de timezone
    let displayDate: string;
    if (isToday) {
      displayDate = "Hoje";
    } else {
      // Extrair dia e mês da string YYYY-MM-DD
      const [year, month, day] = dateKey.split("-");
      displayDate = `${day}/${month}`;
    }

    return {
      date: displayDate,
      revenue: amounts.revenue,
      expense: amounts.expense,
      netProfit: amounts.revenue - amounts.expense,
      fullDate: dateKey,
    };
  });

  console.log("Data do mapa:", Array.from(dateMap.entries()));
  console.log("Dias do gráfico:", chartDays);
  console.log("Dados finais do gráfico:", chartData);

  // Se não há dados, mostrar mensagem
  if (chartData.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        Nenhum dado disponível para o período
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const revenue =
                  payload.find((p) => p.dataKey === "revenue")?.value || 0;
                const expense =
                  payload.find((p) => p.dataKey === "expense")?.value || 0;
                const netProfit = revenue - expense;

                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-green-600">
                      Receitas: R$ {revenue.toFixed(2)}
                    </p>
                    <p className="text-red-600">
                      Despesas: R$ {expense.toFixed(2)}
                    </p>
                    <p
                      className={`font-medium ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      Lucro: R$ {netProfit.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar
            dataKey="revenue"
            name="Receitas"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            className="transition-opacity hover:opacity-80"
          />
          <Bar
            dataKey="expense"
            name="Despesas"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            className="transition-opacity hover:opacity-80"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
