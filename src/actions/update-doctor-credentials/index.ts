"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { doctorsTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { getAuthSession, requireAdmin } from "@/lib/auth-utils";

import { updateDoctorCredentialsSchema } from "./schema";

export const updateDoctorCredentialsAction = actionClient
  .schema(updateDoctorCredentialsSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();
    requireAdmin(session);

    const { doctorId, email, password } = parsedInput;

    // Normalizar email para minúsculo
    const normalizedEmail = email.toLowerCase();

    console.log("🔄 Update Action iniciada:", {
      doctorId,
      email: normalizedEmail,
    });

    // Verificar se o médico existe
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, doctorId),
    });

    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    if (!doctor.userId) {
      throw new Error("Este médico não possui usuário para atualizar");
    }

    if (doctor.clinicId !== session.user.clinic!.id) {
      throw new Error("Você não tem permissão para atualizar este médico");
    }

    // Verificar se o email já está em uso por outro usuário (permitir mesmo email se for o próprio usuário)
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, normalizedEmail),
    });

    if (existingUser && existingUser.id !== doctor.userId) {
      throw new Error("Este email já está em uso por outro usuário");
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("🔄 Atualizando usuário:", {
      userId: doctor.userId,
      email,
      passwordChanged: true,
    });

    try {
      // Atualizar email e senha
      await db
        .update(usersTable)
        .set({
          email: normalizedEmail,
          hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, doctor.userId));

      revalidatePath("/doctors");

      console.log("✅ Update realizado com sucesso");

      return {
        success: true,
        message: "Email e senha atualizados com sucesso!",
      };
    } catch (error: any) {
      console.error("❌ Erro ao atualizar:", error);
      throw new Error("Erro interno do servidor ao atualizar credenciais");
    }
  });
