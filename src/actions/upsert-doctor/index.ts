"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertDoctorSchema } from "./schema";

dayjs.extend(utc);

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput }) => {
    const availableFromTime = parsedInput.availableFromTime; // 15:30:00
    const availableToTime = parsedInput.availableToTime; // 16:00:00

    // Não converter para UTC - manter horário local
    const availableFromTimeFormatted = availableFromTime;
    const availableToTimeFormatted = availableToTime;

    // Converter data de nascimento se fornecida
    const birthDate = parsedInput.birthDate
      ? dayjs(parsedInput.birthDate).toDate()
      : null;

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    // Preparar dados para inserção/atualização
    const doctorData = {
      ...parsedInput,
      id: parsedInput.id,
      clinicId: session?.user.clinic?.id,
      availableFromTime: availableFromTimeFormatted,
      availableToTime: availableToTimeFormatted,
      birthDate,
      // Limpar campos vazios
      cpf: parsedInput.cpf || null,
      rg: parsedInput.rg || null,
      address: parsedInput.address || null,
      email: parsedInput.email || null,
      phoneNumber: parsedInput.phoneNumber || null,
      crmNumber: parsedInput.crmNumber || null,
      rqe: parsedInput.rqe || null,
      cro: parsedInput.cro || null,
    };

    await db
      .insert(doctorsTable)
      .values(doctorData)
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: doctorData,
      });
    revalidatePath("/doctors");
  });
