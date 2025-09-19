"use client";

import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable } from "@/db/schema";

import { getAppointmentsTableColumns } from "./table-columns";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
};

interface AppointmentsTableClientProps {
  appointments: AppointmentWithRelations[];
  userRole: "admin" | "doctor";
}

export function AppointmentsTableClient({
  appointments,
  userRole,
}: AppointmentsTableClientProps) {
  return (
    <DataTable
      data={appointments}
      columns={getAppointmentsTableColumns(userRole)}
      searchKey="patient.name"
      searchPlaceholder="Pesquisar agendamentos por paciente..."
    />
  );
}
