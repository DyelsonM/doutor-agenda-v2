"use client";

import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable } from "@/db/schema";

import { getAppointmentsTableColumns } from "../../appointments/_components/table-columns";

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

interface TodayAppointmentsTableProps {
  appointments: AppointmentWithRelations[];
}

export function TodayAppointmentsTable({
  appointments,
}: TodayAppointmentsTableProps) {
  return (
    <DataTable
      data={appointments}
      columns={getAppointmentsTableColumns("admin", [], [])}
    />
  );
}
