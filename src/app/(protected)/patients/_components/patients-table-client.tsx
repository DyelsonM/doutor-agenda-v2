"use client";

import { DataTable } from "@/components/ui/data-table";
import { patientsTable } from "@/db/schema";

import { getPatientsTableColumns } from "./table-columns";

type Patient = typeof patientsTable.$inferSelect;

interface PatientsTableClientProps {
  patients: Patient[];
  userRole: "admin" | "doctor";
}

export function PatientsTableClient({
  patients,
  userRole,
}: PatientsTableClientProps) {
  return (
    <DataTable data={patients} columns={getPatientsTableColumns(userRole)} />
  );
}
