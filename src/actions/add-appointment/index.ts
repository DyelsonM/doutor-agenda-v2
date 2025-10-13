"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

dayjs.extend(utc);
dayjs.extend(timezone);

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {
  createAppointmentNotification,
  notifyDoctorsAboutAppointment,
} from "@/helpers/notifications";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { addAppointmentSchema } from "./schema";

export const addAppointment = actionClient
  .schema(addAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    // Buscar dados do médico para validação adicional
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    // Validação adicional: verificar se o horário está dentro da disponibilidade do médico
    const appointmentHour = parseInt(parsedInput.time.split(":")[0]);
    const appointmentMinute = parseInt(parsedInput.time.split(":")[1]);
    const appointmentTimeInMinutes = appointmentHour * 60 + appointmentMinute;

    const doctorFromHour = Number(doctor.availableFromTime.split(":")[0]);
    const doctorFromMinute = Number(doctor.availableFromTime.split(":")[1]);
    const doctorToHour = Number(doctor.availableToTime.split(":")[0]);
    const doctorToMinute = Number(doctor.availableToTime.split(":")[1]);

    const doctorFromInMinutes = doctorFromHour * 60 + doctorFromMinute;
    const doctorToInMinutes = doctorToHour * 60 + doctorToMinute;

    if (
      appointmentTimeInMinutes < doctorFromInMinutes ||
      appointmentTimeInMinutes > doctorToInMinutes
    ) {
      throw new Error(
        `Horário fora da disponibilidade do médico (${doctor.availableFromTime} às ${doctor.availableToTime})`,
      );
    }

    // Criar data/hora do agendamento corretamente
    // parsedInput.date vem como Date, mas precisamos interpretar como horário do Brasil
    // Independentemente do timezone do servidor
    const appointmentDateTime = dayjs(parsedInput.date)
      .hour(parseInt(parsedInput.time.split(":")[0]))
      .minute(parseInt(parsedInput.time.split(":")[1]))
      .second(0)
      .millisecond(0)
      .tz("America/Sao_Paulo", true) // true = manter o horário local, apenas mudar timezone
      .utc() // Converter para UTC para armazenar no banco
      .toDate();

    const [newAppointment] = await db
      .insert(appointmentsTable)
      .values({
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
        modality: parsedInput.modality, // Agora salva o nome da modalidade
        isReturn: parsedInput.isReturn,
        clinicId: session?.user.clinic?.id,
        date: appointmentDateTime,
      })
      .returning({ id: appointmentsTable.id });

    // Criar notificações para o agendamento criado
    if (newAppointment.id) {
      try {
        // Notificar o criador do agendamento (admin)
        await createAppointmentNotification({
          appointmentId: newAppointment.id,
          userId: session.user.id,
          clinicId: session.user.clinic.id,
        });

        // Notificar todos os médicos da clínica (exceto quem criou se for médico)
        await notifyDoctorsAboutAppointment({
          appointmentId: newAppointment.id,
          clinicId: session.user.clinic.id,
          excludeUserId:
            session.user.role === "doctor" ? session.user.id : undefined,
        });
      } catch (error) {
        console.error("Error creating appointment notifications:", error);
        // Não falha a criação do agendamento se a notificação falhar
      }
    }

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });
