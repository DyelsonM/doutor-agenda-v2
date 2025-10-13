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
      doctorId: z.string().min(1, "ID do médico é obrigatório"),
      date: z.string().date("Data deve estar no formato YYYY-MM-DD"),
      excludeAppointmentId: z.string().uuid().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) {
        throw new Error("Unauthorized");
      }
      if (!session.user.clinic) {
        throw new Error("Clínica não encontrada");
      }

      // Buscar médico com cache otimizado
      const doctor = await db.query.doctorsTable.findFirst({
        where: eq(doctorsTable.id, parsedInput.doctorId),
        columns: {
          id: true,
          name: true,
          availableFromWeekDay: true,
          availableToWeekDay: true,
          availableFromTime: true,
          availableToTime: true,
        },
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

      // Buscar TODOS os agendamentos do médico (sem filtro de data)
      const allAppointments = await db.query.appointmentsTable.findMany({
        where: eq(appointmentsTable.doctorId, parsedInput.doctorId),
      });

      // Filtrar em memória por data
      const appointmentsOnSelectedDate = allAppointments
        .filter((appointment) => {
          const appointmentDate = dayjs(appointment.date)
            .utc()
            .tz("America/Sao_Paulo")
            .format("YYYY-MM-DD");
          return appointmentDate === parsedInput.date;
        })
        .filter((appointment) => {
          // Excluir appointment específico se fornecido
          if (parsedInput.excludeAppointmentId) {
            return appointment.id !== parsedInput.excludeAppointmentId;
          }
          return true;
        })
        .map((appointment) =>
          dayjs(appointment.date)
            .utc()
            .tz("America/Sao_Paulo")
            .format("HH:mm:ss"),
        );

      // Gerar slots de tempo
      const timeSlots = generateTimeSlots();

      // Filtrar horários do médico
      const doctorTimeSlots = timeSlots.filter((time) => {
        const timeHour = Number(time.split(":")[0]);
        const timeMinute = Number(time.split(":")[1]);

        const doctorFromHour = Number(doctor.availableFromTime.split(":")[0]);
        const doctorFromMinute = Number(doctor.availableFromTime.split(":")[1]);
        const doctorToHour = Number(doctor.availableToTime.split(":")[0]);
        const doctorToMinute = Number(doctor.availableToTime.split(":")[1]);

        // Converter para minutos para facilitar comparação
        const timeInMinutes = timeHour * 60 + timeMinute;
        const doctorFromInMinutes = doctorFromHour * 60 + doctorFromMinute;
        const doctorToInMinutes = doctorToHour * 60 + doctorToMinute;

        return (
          timeInMinutes >= doctorFromInMinutes &&
          timeInMinutes <= doctorToInMinutes
        );
      });

      // Mapear resultado final
      const result = doctorTimeSlots.map((time) => {
        const isBooked = appointmentsOnSelectedDate.includes(time);

        return {
          value: time,
          available: !isBooked,
          label: time.substring(0, 5),
        };
      });

      // Garantir que sempre retornamos um array válido
      return result.length > 0 ? result : [];
    } catch (error) {
      console.error("Erro em getAvailableTimes:", error);
      throw error;
    }
  });
