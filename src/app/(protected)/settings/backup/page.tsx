"use client";

import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { backupAction } from "@/actions/backup";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Separator } from "@/components/ui/separator";

interface BackupStats {
  database: {
    daily: number;
    weekly: number;
    monthly: number;
    totalSize: number;
  };
  files: {
    daily: number;
    weekly: number;
    monthly: number;
    totalSize: number;
  };
  totalFiles: number;
  totalSize: number;
}

export default function BackupSettingsPage() {
  const [backupStats, setBackupStats] = useState<BackupStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const backupActionHook = useAction(backupAction, {
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.action === "stats") {
        // Parse stats from output
        try {
          const stats = parseStatsFromOutput(data.output);
          setBackupStats(stats);
        } catch (error) {
          console.error("Erro ao parsear estatísticas:", error);
        }
      }
    },
    onError: (error) => {
      toast.error(error.serverError || "Erro ao executar ação de backup");
    },
  });

  const parseStatsFromOutput = (output: string): BackupStats => {
    const lines = output.split("\n");
    const stats: BackupStats = {
      database: { daily: 0, weekly: 0, monthly: 0, totalSize: 0 },
      files: { daily: 0, weekly: 0, monthly: 0, totalSize: 0 },
      totalFiles: 0,
      totalSize: 0,
    };

    // Parse database stats
    lines.forEach((line) => {
      if (line.includes("Diário:") && line.includes("arquivos")) {
        const match = line.match(/Diário:\s*(\d+)\s+arquivos/);
        if (match) {
          stats.database.daily = parseInt(match[1]);
        }
      }
      if (line.includes("Semanal:") && line.includes("arquivos")) {
        const match = line.match(/Semanal:\s*(\d+)\s+arquivos/);
        if (match) {
          stats.database.weekly = parseInt(match[1]);
        }
      }
      if (line.includes("Mensal:") && line.includes("arquivos")) {
        const match = line.match(/Mensal:\s*(\d+)\s+arquivos/);
        if (match) {
          stats.database.monthly = parseInt(match[1]);
        }
      }
      if (line.includes("Tamanho total:") && line.includes("MB")) {
        const match = line.match(/Tamanho total:\s*([\d.]+)MB/);
        if (match) {
          stats.database.totalSize = parseFloat(match[1]) * 1024 * 1024; // Convert MB to bytes
        }
      }
    });

    // Parse files stats
    lines.forEach((line) => {
      if (line.includes("Arquivos:") && line.includes("Diário:")) {
        const match = line.match(/Diário:\s*(\d+)\s+arquivos/);
        if (match) {
          stats.files.daily = parseInt(match[1]);
        }
      }
      if (line.includes("Arquivos:") && line.includes("Semanal:")) {
        const match = line.match(/Semanal:\s*(\d+)\s+arquivos/);
        if (match) {
          stats.files.weekly = parseInt(match[1]);
        }
      }
      if (line.includes("Arquivos:") && line.includes("Mensal:")) {
        const match = line.match(/Mensal:\s*(\d+)\s+arquivos/);
        if (match) {
          stats.files.monthly = parseInt(match[1]);
        }
      }
    });

    // Parse total stats
    lines.forEach((line) => {
      if (line.includes("Total:") && line.includes("arquivos")) {
        const match = line.match(/Total:\s*(\d+)\s+arquivos,\s*([\d.]+)MB/);
        if (match) {
          stats.totalFiles = parseInt(match[1]);
          stats.totalSize = parseFloat(match[2]) * 1024 * 1024; // Convert MB to bytes
        }
      }
    });

    return stats;
  };

  const handleBackup = async (type: "daily" | "weekly" | "monthly") => {
    setIsLoading(true);
    await backupActionHook.execute({
      type,
      action: "create",
    });
    setIsLoading(false);
  };

  const handleListBackups = async () => {
    setIsLoading(true);
    await backupActionHook.execute({
      type: "daily", // Type doesn't matter for list
      action: "list",
    });
    setIsLoading(false);
  };

  const handleGetStats = async () => {
    setIsLoading(true);
    await backupActionHook.execute({
      type: "daily", // Type doesn't matter for stats
      action: "stats",
    });
    setIsLoading(false);
  };

  const handleRestore = async (
    type: "daily" | "weekly" | "monthly",
    filename: string,
  ) => {
    setIsLoading(true);
    await backupActionHook.execute({
      type,
      action: "restore",
      filename,
      confirm: true,
    });
    setIsLoading(false);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Configurações de Backup</PageTitle>
          <PageDescription>
            Gerencie backups do banco de dados e arquivos do sistema
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button
            onClick={handleGetStats}
            disabled={isLoading}
            variant="outline"
          >
            Atualizar Estatísticas
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent className="space-y-6">
        {/* Estatísticas */}
        {backupStats && (
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Backup</CardTitle>
              <CardDescription>
                Resumo dos backups armazenados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {backupStats.totalFiles}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Total de Arquivos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(backupStats.totalSize / (1024 * 1024)).toFixed(2)}MB
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Tamanho Total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {backupStats.database.daily +
                      backupStats.database.weekly +
                      backupStats.database.monthly}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Backups de Banco
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações de Backup */}
        <Card>
          <CardHeader>
            <CardTitle>Criar Backup</CardTitle>
            <CardDescription>
              Execute backups manuais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">Backup Diário</h4>
                <p className="text-muted-foreground text-sm">
                  Backup completo diário (banco + arquivos)
                </p>
                <Button
                  onClick={() => handleBackup("daily")}
                  disabled={isLoading}
                  className="w-full"
                >
                  Criar Backup Diário
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Backup Semanal</h4>
                <p className="text-muted-foreground text-sm">
                  Backup completo semanal (banco + arquivos)
                </p>
                <Button
                  onClick={() => handleBackup("weekly")}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  Criar Backup Semanal
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Backup Mensal</h4>
                <p className="text-muted-foreground text-sm">
                  Backup completo mensal (banco + arquivos)
                </p>
                <Button
                  onClick={() => handleBackup("monthly")}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  Criar Backup Mensal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gerenciamento */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento</CardTitle>
            <CardDescription>
              Visualize e gerencie backups existentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={handleListBackups}
                disabled={isLoading}
                variant="outline"
              >
                Listar Backups
              </Button>

              <Button
                onClick={handleGetStats}
                disabled={isLoading}
                variant="outline"
              >
                Atualizar Estatísticas
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Restaurar Backup</h4>
              <p className="text-muted-foreground text-sm">
                ⚠️ Cuidado: Restaurar um backup irá sobrescrever todos os dados
                atuais
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    Restaurar Backup
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Restauração</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá sobrescrever todos os dados atuais com o
                      backup selecionado. Esta operação não pode ser desfeita.
                      Tem certeza que deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        // Implementar seleção de arquivo
                        toast.error(
                          "Funcionalidade de restore será implementada em breve",
                        );
                      }}
                    >
                      Confirmar Restauração
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Detalhes sobre a configuração de backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Retenção de Backups</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Diários:</span>
                    <Badge variant="secondary">7 dias</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Semanais:</span>
                    <Badge variant="secondary">4 semanas</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mensais:</span>
                    <Badge variant="secondary">12 meses</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Componentes Incluídos</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Banco de Dados</Badge>
                    <span className="text-muted-foreground text-sm">
                      PostgreSQL
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Arquivos</Badge>
                    <span className="text-muted-foreground text-sm">
                      Uploads, Config
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Limpeza</Badge>
                    <span className="text-muted-foreground text-sm">
                      Automática
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}
