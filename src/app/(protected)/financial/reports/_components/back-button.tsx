"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/financial/reports");
  };

  return (
    <Button variant="outline" onClick={handleBack} className="mb-6">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Voltar para Relatórios
    </Button>
  );
}
