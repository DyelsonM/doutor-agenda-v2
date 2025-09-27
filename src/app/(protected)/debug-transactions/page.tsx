"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { debugCashAction } from "@/actions/daily-cash";

export default function DebugTransactionsPage() {
  const [debugData, setDebugData] = useState<any>(null);

  const { execute: executeDebug, isExecuting } = useAction(debugCashAction, {
    onSuccess: ({ data }) => {
      console.log("Debug data received:", data);
      setDebugData(data);
    },
    onError: ({ error }) => {
      console.error("Debug error:", error);
    },
  });

  const handleDebug = () => {
    executeDebug({});
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug de Caixa Diário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleDebug} disabled={isExecuting}>
            {isExecuting ? "Executando..." : "Executar Debug"}
          </Button>

          {debugData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">
                  Caixas Recentes ({debugData.recentCashCount})
                </h3>
                <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {JSON.stringify(debugData.recentCash, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
