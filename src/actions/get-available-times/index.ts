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

    // Otimização: Filtrar por data diretamente no banco de dados
    // Garantir que estamos trabalhando com horário do Brasil
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

    // Debug para produção
    console.log("🔍 Debug - Data solicitada:", parsedInput.date);
    console.log("🔍 Debug - Start of day (UTC):", startOfDay);
    console.log("🔍 Debug - End of day (UTC):", endOfDay);

    // Construir filtros dinamicamente
    const filters = [
      eq(appointmentsTable.doctorId, parsedInput.doctorId),
      gte(appointmentsTable.date, startOfDay),
      lte(appointmentsTable.date, endOfDay),
    ];

    // Excluir appointment específico se fornecido
    if (parsedInput.excludeAppointmentId) {
      filters.push(ne(appointmentsTable.id, parsedInput.excludeAppointmentId));
    }

    const appointments = await db.query.appointmentsTable.findMany({
      where: and(...filters),
      columns: {
        date: true,
      },
    });

    const appointmentsOnSelectedDate = appointments.map((appointment) =>
      dayjs(appointment.date).utc().tz("America/Sao_Paulo").format("HH:mm:ss"),
    );

    // Debug para produção
    console.log("🔍 Debug - Agendamentos encontrados:", appointmentsOnSelectedDate);
    const timeSlots = generateTimeSlots();

    // Usar os horários do médico diretamente (já estão em horário local)
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
    // Permitir agendamentos em todos os horários, mesmo os que já passaram
    return doctorTimeSlots.map((time) => {
      const isBooked = appointmentsOnSelectedDate.includes(time);

      return {
        value: time,
        available: !isBooked, // Removida a validação de horários passados
        label: time.substring(0, 5),
      };
    });
  });
