"use server";

import { exec } from "child_process";
import fs from "fs/promises";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import path from "path";
import { promisify } from "util";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const execAsync = promisify(exec);

const backupActionSchema = z.object({
  type: z.enum(["daily", "weekly", "monthly"]),
  action: z.enum(["create", "list", "restore", "stats"]),
  filename: z.string().optional(),
  confirm: z.boolean().optional(),
});

export const backupAction = actionClient
  .schema(backupActionSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.role !== "admin") {
      throw new Error("Apenas administradores podem gerenciar backups");
    }

    const { type, action, filename, confirm } = parsedInput;

    try {
      // Mudar para o diretório do projeto
      const projectDir = process.cwd();

      switch (action) {
        case "create":
          const createCommand = `cd "${projectDir}" && node scripts/backup-manager.js ${type}`;
          const createResult = await execAsync(createCommand);
          return {
            success: true,
            message: `Backup ${type} criado com sucesso`,
            output: createResult.stdout,
            action: "create",
          };

        case "list":
          const listCommand = `cd "${projectDir}" && node scripts/backup-manager.js list`;
          const listResult = await execAsync(listCommand);
          return {
            success: true,
            message: "Lista de backups obtida",
            output: listResult.stdout,
            action: "list",
          };

        case "stats":
          const statsCommand = `cd "${projectDir}" && node scripts/cleanup-backups.js stats`;
          const statsResult = await execAsync(statsCommand);
          return {
            success: true,
            message: "Estatísticas obtidas",
            output: statsResult.stdout,
            action: "stats",
          };

        case "restore":
          if (!filename) {
            throw new Error("Nome do arquivo é obrigatório para restore");
          }

          if (!confirm) {
            throw new Error("Confirmação é obrigatória para restore");
          }

          const restoreCommand = `cd "${projectDir}" && node scripts/backup-manager.js restore ${type} ${filename} --confirm`;
          const restoreResult = await execAsync(restoreCommand);
          return {
            success: true,
            message: `Backup ${filename} restaurado com sucesso`,
            output: restoreResult.stdout,
            action: "restore",
          };

        default:
          throw new Error("Ação não reconhecida");
      }
    } catch (error) {
      console.error("Erro na ação de backup:", error);
      throw new Error(
        error instanceof Error ? error.message : "Erro desconhecido",
      );
    } finally {
      revalidatePath("/settings");
    }
  });
