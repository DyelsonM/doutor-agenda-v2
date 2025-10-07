"use client";

import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

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
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export function AppointmentsTableClient({
  appointments,
  userRole,
  patients,
  doctors,
}: AppointmentsTableClientProps) {
  return (
    <DataTable
      data={appointments}
      columns={getAppointmentsTableColumns(userRole, patients, doctors)}
      searchKeys={[
        "patient.name",
        "patient.phoneNumber",
        "doctor.name",
        "modality",
      ]}
      searchPlaceholder="Pesquisar agendamentos por paciente, médico, telefone ou modalidade..."
      maxHeight="70vh"
    />
  );
}
