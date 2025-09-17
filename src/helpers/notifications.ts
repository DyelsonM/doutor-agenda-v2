import dayjs from "dayjs";
import { and, eq, gte, like,lt } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  doctorsTable,
  notificationsTable,
  patientsTable,
  payablesTable,
  usersTable,
} from "@/db/schema";

interface CreateAppointmentNotificationProps {
  appointmentId: string;
  userId: string;
  clinicId: string;
}

export async function createAppointmentNotification({
  appointmentId,
  userId,
  clinicId,
}: CreateAppointmentNotificationProps) {
  // Buscar dados do agendamento
  const appointment = await db
    .select({
      id: appointmentsTable.id,
      date: appointmentsTable.date,
      patient: {
        name: patientsTable.name,
      },
      doctor: {
        name: doctorsTable.name,
      },
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(eq(appointmentsTable.id, appointmentId))
    .limit(1);

  if (!appointment[0]) {
    throw new Error("Appointment not found");
  }

  const appointmentData = appointment[0];
  const formattedDate = dayjs(appointmentData.date).format("DD/MM/YYYY");
  const formattedTime = dayjs(appointmentData.date).format("HH:mm");

  await db.insert(notificationsTable).values({
    userId,
    clinicId,
    type: "appointment_reminder", // Usando um tipo mais apropriado
    title: "Novo Agendamento Criado",
    message: `Agendamento criado para ${appointmentData.patient?.name} com Dr. ${appointmentData.doctor?.name} em ${formattedDate} às ${formattedTime}`,
    data: JSON.stringify({
      appointmentId,
      patientName: appointmentData.patient?.name,
      doctorName: appointmentData.doctor?.name,
      date: appointmentData.date,
    }),
    status: "unread",
  });
}

interface CheckUpcomingPayablesProps {
  clinicId: string;
  userId: string;
}

export async function checkUpcomingPayables({
  clinicId,
  userId,
}: CheckUpcomingPayablesProps) {
  // Buscar contas que vencem em 2 dias
  const twoDaysFromNow = dayjs().add(2, "days").startOf("day").toDate();
  const threeDaysFromNow = dayjs().add(3, "days").startOf("day").toDate();

  const upcomingPayables = await db
    .select()
    .from(payablesTable)
    .where(
      and(
        eq(payablesTable.clinicId, clinicId),
        eq(payablesTable.status, "pending"),
        gte(payablesTable.dueDate, twoDaysFromNow),
        lt(payablesTable.dueDate, threeDaysFromNow),
      ),
    );

  // Criar notificações para cada conta próxima do vencimento
  for (const payable of upcomingPayables) {
    // Verificar se já existe notificação para esta conta
    const existingNotification = await db
      .select()
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.userId, userId),
          eq(notificationsTable.clinicId, clinicId),
          eq(notificationsTable.type, "payable_due"),
          like(notificationsTable.data, `%"payableId":"${payable.id}"%`),
        ),
      )
      .limit(1);

    if (existingNotification.length === 0) {
      const formattedDate = dayjs(payable.dueDate).format("DD/MM/YYYY");

      await db.insert(notificationsTable).values({
        userId,
        clinicId,
        type: "payable_due",
        title: "Conta a Pagar Vencendo",
        message: `A conta "${payable.description}" vence em ${formattedDate}. Valor: R$ ${(payable.amountInCents / 100).toFixed(2)}`,
        data: JSON.stringify({
          payableId: payable.id,
          description: payable.description,
          amountInCents: payable.amountInCents,
          dueDate: payable.dueDate,
        }),
        status: "unread",
      });
    }
  }

  return upcomingPayables.length;
}

// Função helper para buscar todos os médicos de uma clínica
async function getClinicDoctorUsers(clinicId: string) {
  const doctorUsers = await db
    .select({
      userId: usersTable.id,
      doctorName: doctorsTable.name,
    })
    .from(doctorsTable)
    .leftJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
    .where(
      and(eq(doctorsTable.clinicId, clinicId), eq(usersTable.role, "doctor")),
    );

  return doctorUsers.filter((user) => user.userId !== null);
}

// Função para notificar médicos sobre novos agendamentos
export async function notifyDoctorsAboutAppointment({
  appointmentId,
  clinicId,
  excludeUserId,
}: {
  appointmentId: string;
  clinicId: string;
  excludeUserId?: string;
}) {
  // Buscar dados do agendamento
  const appointment = await db
    .select({
      id: appointmentsTable.id,
      date: appointmentsTable.date,
      doctorId: appointmentsTable.doctorId,
      patient: {
        name: patientsTable.name,
      },
      doctor: {
        name: doctorsTable.name,
      },
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(eq(appointmentsTable.id, appointmentId))
    .limit(1);

  if (!appointment[0]) {
    throw new Error("Appointment not found");
  }

  const appointmentData = appointment[0];
  const formattedDate = dayjs(appointmentData.date).format("DD/MM/YYYY");
  const formattedTime = dayjs(appointmentData.date).format("HH:mm");

  // Buscar todos os médicos da clínica
  const doctorUsers = await getClinicDoctorUsers(clinicId);

  // Notificar cada médico
  for (const doctorUser of doctorUsers) {
    if (doctorUser.userId === excludeUserId) continue; // Não notificar quem criou

    await db.insert(notificationsTable).values({
      userId: doctorUser.userId,
      clinicId,
      type: "appointment_reminder",
      title: "Novo Agendamento na Clínica",
      message: `Agendamento criado para ${appointmentData.patient?.name} com Dr. ${appointmentData.doctor?.name} em ${formattedDate} às ${formattedTime}`,
      data: JSON.stringify({
        appointmentId,
        patientName: appointmentData.patient?.name,
        doctorName: appointmentData.doctor?.name,
        date: appointmentData.date,
        isForDoctor: appointmentData.doctorId,
      }),
      status: "unread",
    });
  }
}
