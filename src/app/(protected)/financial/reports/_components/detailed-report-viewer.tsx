"use client";

import { FileBarChart } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface DetailedReportViewerProps {
  report: {
    id: string;
    reportType: string;
    periodStart: Date;
    periodEnd: Date;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    appointmentCount: number;
  };
  reportTitle: string;
}

export function DetailedReportViewer({
  report,
  reportTitle,
}: DetailedReportViewerProps) {
  const router = useRouter();

  const handleViewDetailedReport = () => {
    router.push(`/financial/reports/${report.id}`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleViewDetailedReport}>
      <FileBarChart className="mr-2 h-4 w-4" />
      Detalhado
    </Button>
  );
}
