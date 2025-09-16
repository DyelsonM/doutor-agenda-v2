"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import {
  createAppointmentNotification,
  notifyDoctorsAboutAppointment,
} from "@/helpers/notifications";

import { getAvailableTimes } from "../get-available-times";
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

    // Validar horário disponível
    const availableTimes = await getAvailableTimes({
      doctorId: parsedInput.doctorId,
      date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
    });
    if (!availableTimes?.data) {
      throw new Error("No available times");
    }
    const isTimeAvailable = availableTimes.data?.some(
      (time) => time.value === parsedInput.time && time.available,
    );
    if (!isTimeAvailable) {
      throw new Error("Time not available");
    }

    // Criar data/hora do agendamento
    const appointmentDateTime = dayjs(parsedInput.date)
      .set("hour", parseInt(parsedInput.time.split(":")[0]))
      .set("minute", parseInt(parsedInput.time.split(":")[1]))
      .toDate();

    const [newAppointment] = await db
      .insert(appointmentsTable)
      .values({
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
        modality: parsedInput.modality,
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
