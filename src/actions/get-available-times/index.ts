"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq, gte, lte, ne } from "drizzle-orm";
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

      console.log("🔍 Debug - Médico encontrado:", {
        id: doctor?.id,
        name: doctor?.name,
        availableFromTime: doctor?.availableFromTime,
        availableToTime: doctor?.availableToTime,
        availableFromWeekDay: doctor?.availableFromWeekDay,
        availableToWeekDay: doctor?.availableToWeekDay,
      });

      if (!doctor) {
        console.log(
          "🚨 Erro - Médico não encontrado para ID:",
          parsedInput.doctorId,
        );
        throw new Error("Médico não encontrado");
      }

      const selectedDayOfWeek = dayjs(parsedInput.date).day();
      const doctorIsAvailable =
        selectedDayOfWeek >= doctor.availableFromWeekDay &&
        selectedDayOfWeek <= doctor.availableToWeekDay;

      console.log("🔍 Debug - Verificação de disponibilidade:", {
        selectedDate: parsedInput.date,
        selectedDayOfWeek,
        doctorFromWeekDay: doctor.availableFromWeekDay,
        doctorToWeekDay: doctor.availableToWeekDay,
        doctorIsAvailable,
      });

      if (!doctorIsAvailable) {
        console.log("🚨 Médico não disponível neste dia da semana");
        return [];
      }

      // Otimização: Usar índices de performance para query mais rápida
      const startOfDay = dayjs(parsedInput.date)
        .tz("America/Sao_Paulo", true)
        .startOf("day")
        .utc()
        .toDate();
      const endOfDay = dayjs(parsedInput.date)
        .tz("America/Sao_Paulo", true)
        .endOf("day")
        .utc()
        .toDate();

      // Construir filtros otimizados
      const filters = [
        eq(appointmentsTable.doctorId, parsedInput.doctorId),
        gte(appointmentsTable.date, startOfDay),
        lte(appointmentsTable.date, endOfDay),
      ];

      // Excluir appointment específico se fornecido
      if (parsedInput.excludeAppointmentId) {
        filters.push(
          ne(appointmentsTable.id, parsedInput.excludeAppointmentId),
        );
      }

      // Query otimizada usando índices
      const appointments = await db.query.appointmentsTable.findMany({
        where: and(...filters),
        columns: {
          date: true,
        },
      });

      const appointmentsOnSelectedDate = appointments.map((appointment) =>
        dayjs(appointment.date)
          .utc()
          .tz("America/Sao_Paulo")
          .format("HH:mm:ss"),
      );

      // Gerar slots de tempo otimizados
      const timeSlots = generateTimeSlots();
      console.log("🔍 Debug - Total de slots gerados:", timeSlots.length);
      console.log("🔍 Debug - Primeiros 5 slots:", timeSlots.slice(0, 5));

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

      console.log("🔍 Debug - Slots do médico:", {
        total: doctorTimeSlots.length,
        first5: doctorTimeSlots.slice(0, 5),
        doctorFromTime: doctor.availableFromTime,
        doctorToTime: doctor.availableToTime,
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

      console.log("🔍 Debug - Resultado final:", {
        total: result.length,
        available: result.filter((r) => r.available).length,
        booked: result.filter((r) => !r.available).length,
        first5: result.slice(0, 5),
      });

      // Garantir que sempre retornamos um array válido
      return result.length > 0 ? result : [];
    } catch (error) {
      console.error("Erro em getAvailableTimes:", error);
      throw error;
    }
  });
