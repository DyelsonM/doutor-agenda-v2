"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string().date(), // YYYY-MM-DD,
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      throw new Error("Unauthorized");
    }
    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }
    const selectedDayOfWeek = dayjs(parsedInput.date).day();
    const doctorIsAvailable =
      selectedDayOfWeek >= doctor.availableFromWeekDay &&
      selectedDayOfWeek <= doctor.availableToWeekDay;
    if (!doctorIsAvailable) {
      return [];
    }
    const appointments = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.doctorId, parsedInput.doctorId),
    });
    const appointmentsOnSelectedDate = appointments
      .filter((appointment) => {
        return dayjs(appointment.date).isSame(parsedInput.date, "day");
      })
      .map((appointment) => dayjs(appointment.date).format("HH:mm:ss"));
    const timeSlots = generateTimeSlots();

    // Converter horários do médico de UTC para local (se necessário)
    // Se os horários estão em UTC, precisamos ajustar para o horário local
    const doctorFromHour = Number(doctor.availableFromTime.split(":")[0]);
    const doctorToHour = Number(doctor.availableToTime.split(":")[0]);

    // Se o horário está muito tarde (provavelmente UTC), ajustar para local
    let doctorFromTimeAdjusted = doctor.availableFromTime;
    let doctorToTimeAdjusted = doctor.availableToTime;

    if (doctorFromHour >= 14 || doctorToHour >= 23) {
      // Ajustar 3 horas para trás (UTC para BRT)
      const fromHour = (doctorFromHour - 3 + 24) % 24;
      const toHour = (doctorToHour - 3 + 24) % 24;

      doctorFromTimeAdjusted = `${fromHour.toString().padStart(2, "0")}:${doctor.availableFromTime.split(":")[1]}:${doctor.availableFromTime.split(":")[2]}`;
      doctorToTimeAdjusted = `${toHour.toString().padStart(2, "0")}:${doctor.availableToTime.split(":")[1]}:${doctor.availableToTime.split(":")[2]}`;
    }

    const doctorTimeSlots = timeSlots.filter((time) => {
      const timeHour = Number(time.split(":")[0]);
      const timeMinute = Number(time.split(":")[1]);

      const doctorFromHour = Number(doctorFromTimeAdjusted.split(":")[0]);
      const doctorFromMinute = Number(doctorFromTimeAdjusted.split(":")[1]);
      const doctorToHour = Number(doctorToTimeAdjusted.split(":")[0]);
      const doctorToMinute = Number(doctorToTimeAdjusted.split(":")[1]);

      // Converter para minutos para facilitar comparação
      const timeInMinutes = timeHour * 60 + timeMinute;
      const doctorFromInMinutes = doctorFromHour * 60 + doctorFromMinute;
      const doctorToInMinutes = doctorToHour * 60 + doctorToMinute;

      return (
        timeInMinutes >= doctorFromInMinutes &&
        timeInMinutes <= doctorToInMinutes
      );
    });
    // Se for o mesmo dia, filtrar horários que já passaram
    const isToday = dayjs(parsedInput.date).isSame(dayjs(), "day");
    const currentTime = dayjs().format("HH:mm:ss");

    return doctorTimeSlots.map((time) => {
      const isTimePassed = isToday && time < currentTime;
      const isBooked = appointmentsOnSelectedDate.includes(time);

      return {
        value: time,
        available: !isBooked && !isTimePassed,
        label: time.substring(0, 5),
      };
    });
  });
