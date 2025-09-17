"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { doctorsTable, usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getAuthSession, requireAdmin } from "@/lib/auth-utils";
import { actionClient } from "@/lib/next-safe-action";

import { createDoctorUserSchema } from "./schema";

/**
 * Gerar senha aleatória segura
 */

export const createDoctorUserAction = actionClient
  .schema(createDoctorUserSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    // Verificar se é admin
    requireAdmin(session);

    const { doctorId, email, password } = parsedInput;

    // Normalizar email para minúsculo
    const normalizedEmail = email.toLowerCase();

    // Verificar se o médico existe e pertence à clínica
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, doctorId),
    });

    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    if (doctor.clinicId !== session.user.clinic!.id) {
      throw new Error(
        "Você não tem permissão para criar usuário para este médico",
      );
    }

    // Verificar se o médico já tem usuário
    if (doctor.userId) {
      throw new Error("Este médico já possui um usuário vinculado");
    }

    console.log("🔄 Action iniciada:", {
      doctorId,
      email: normalizedEmail,
      doctorUserId: doctor.userId,
    });

    // Verificar se o email já está em uso
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, normalizedEmail),
    });

    if (existingUser) {
      throw new Error("Este email já está em uso");
    }

    // Usar a senha fornecida
    const finalPassword = password;

    // Validar senha
    if (!finalPassword || finalPassword.length < 8) {
      throw new Error("Senha deve ter pelo menos 8 caracteres");
    }

    try {
      // Criar novo usuário
      const { user: newUser } = await auth.api.signUpEmail({
        body: {
          email: normalizedEmail,
          password: finalPassword,
          name: doctor.name,
        },
        asResponse: false,
      });

      if (!newUser) {
        throw new Error("Erro ao criar usuário");
      }

      // Atualizar o role do usuário para 'doctor'
      await db
        .update(usersTable)
        .set({
          role: "doctor",
        })
        .where(eq(usersTable.id, newUser.id));

      // Vincular usuário ao médico
      await db
        .update(doctorsTable)
        .set({
          userId: newUser.id,
        })
        .where(eq(doctorsTable.id, doctorId));

      // Vincular usuário à clínica
      await db.insert(usersToClinicsTable).values({
        userId: newUser.id,
        clinicId: session.user.clinic!.id,
      });

      revalidatePath("/doctors");

      console.log("✅ Usuário criado com sucesso:", {
        userId: newUser.id,
        email: newUser.email,
      });

      return {
        success: true,
        message: "Usuário criado com sucesso!",
      };
    } catch (error: unknown) {
      console.error("Erro ao criar usuário para médico:", error);

      // Verificar se é erro de email duplicado
      if (
        (error instanceof Error && error.message?.includes("email")) ||
        (error instanceof Error && error.message?.includes("duplicate"))
      ) {
        throw new Error("Este email já está em uso");
      }

      throw new Error("Erro interno do servidor ao criar usuário");
    }
  });
