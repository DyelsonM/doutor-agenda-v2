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
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { getAvailableTimes } from "../get-available-times";
import { updateAppointmentSchema } from "./schema";

export const updateAppointment = actionClient
  .schema(updateAppointmentSchema)
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

    // Verificar se o agendamento existe e pertence à clínica
    const existingAppointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, parsedInput.id),
    });

    if (!existingAppointment) {
      throw new Error("Agendamento não encontrado");
    }

    if (existingAppointment.clinicId !== session.user.clinic.id) {
      throw new Error("Agendamento não pertence à sua clínica");
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

    // Validar horário disponível (excluindo o próprio agendamento)
    const availableTimes = await getAvailableTimes({
      doctorId: parsedInput.doctorId,
      date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
      excludeAppointmentId: parsedInput.id,
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

    // Criar data/hora do agendamento corretamente
    const appointmentDateTime = dayjs(parsedInput.date)
      .hour(parseInt(parsedInput.time.split(":")[0]))
      .minute(parseInt(parsedInput.time.split(":")[1]))
      .second(0)
      .millisecond(0)
      .tz("America/Sao_Paulo", true) // true = manter o horário local, apenas mudar timezone
      .utc() // Converter para UTC para armazenar no banco
      .toDate();

    await db
      .update(appointmentsTable)
      .set({
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
        modality: parsedInput.modality,
        date: appointmentDateTime,
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, parsedInput.id));

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });
